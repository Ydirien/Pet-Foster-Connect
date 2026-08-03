# Tests de l'API Pet Foster Connect

## Vue d'ensemble

Les tests de l'API sont des **tests d'intégration** : ils démarrent un vrai serveur Express et une vraie base de données PostgreSQL, puis envoient de vraies requêtes HTTP pour vérifier le comportement de l'application de bout en bout.

Le framework utilisé est **Node.js Test Runner** (module natif `node:test`), sans Jest ni Mocha.

---

## Lancer les tests

```bash
npm test
```

---

## Fichiers de test

Tous les fichiers de test sont suffixés `*.spec.test.ts` et **colocalisés** avec le fichier qu'ils testent (ex: `src/middlewares/rate-limit.middleware.spec.test.ts` à côté de `rate-limit.middleware.ts`, `src/controllers/auth.controller.spec.test.ts` à côté de `auth.controller.ts`).

---

## Ce qui se passe quand on lance `npm test`

La commande complète est :

```bash
node --test \
  --env-file=./test/config/.env.test \
  --import ./test/config/global-setup.ts \
  --experimental-test-isolation=none \
  "src/**/*.spec.test.ts"
```

### `--env-file=./test/config/.env.test`

Charge les variables d'environnement dédiées aux tests **avant** le démarrage :

```env
PORT=7357                        # port du serveur de test (≠ dev)
POSTGRES_PORT=5437                # port de la BDD de test (≠ dev)
POSTGRES_DB=petfosterconnecttest  # base isolée, jamais la base de dev
DATABASE_URL=postgres://...       # URL pointant vers la BDD de test
```

Ces valeurs garantissent que les tests **ne touchent jamais** la base de développement.

### `--import ./test/config/global-setup.ts`

Charge le fichier de configuration globale qui enregistre les hooks du cycle de vie (voir ci-dessous).

### `--experimental-test-isolation=none`

Tous les fichiers de tests partagent le même contexte Node.js. C'est nécessaire pour que `global-setup.ts` puisse enregistrer des hooks `before`/`after` qui s'appliquent à l'ensemble de la suite.

---

## Cycle de vie des tests (`global-setup.ts`)

before() → démarre la BDD Docker + migrations + serveur Express
│
├─ beforeEach() → vide toutes les tables (état propre pour chaque test)
├─ [test 1]
├─ beforeEach() → vide toutes les tables
├─ [test 2]
└─ ...
│
after() → arrête le serveur + déconnecte Prisma + supprime le conteneur Docker


### `before()` — une seule fois avant tous les tests

1. Supprime le conteneur `petfosterconnecttest` s'il existe déjà (nettoyage préventif)
2. Démarre un conteneur **PostgreSQL 17** nommé `petfosterconnecttest` sur le port `5437`
3. Attend que Postgres soit prêt (`pg_isready`)
4. Applique les migrations Prisma (`prisma migrate deploy`)
5. Démarre le serveur Express sur le port `7357`

### `beforeEach()` — avant chaque test

Vide toutes les tables avec un `TRUNCATE ... RESTART IDENTITY CASCADE`.
Cela garantit qu'un test ne peut pas être influencé par les données laissées par le test précédent.

### `after()` — une seule fois après tous les tests

1. Arrête le serveur Express
2. Déconnecte Prisma de la BDD
3. Supprime le conteneur Docker `petfosterconnecttest`

---

## Anatomie d'un test d'intégration

```ts
describe("[POST] /auth/login", () => {
  // 1. ARRANGE — données nécessaires créées en BDD avant le test
  beforeEach(async () => {
    user = await prisma.user.create({ data: { ... } });
  });

  it("should generate a JWT", async () => {
    // 2. ACT — requête HTTP réelle vers le serveur de test
    const httpResponse = await fetch("http://localhost:7357/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // 3. ASSERT — vérification du statut HTTP et du corps de la réponse
    assert.strictEqual(httpResponse.status, 200);
    assert.ok(body.accessToken.token);
  });
});
```

Le pattern suivi est **AAA : Arrange / Act / Assert**.

---

## Pourquoi Docker pour les tests ?

La base de données de test est lancée dans un conteneur Docker éphémère pour :

- **Isoler** les tests de la base de développement
- **Reproductibilité** : chaque run repart d'une base vierge
- **Pas de configuration manuelle** : pas besoin d'avoir une instance Postgres déjà configurée sur la machine

Le conteneur est automatiquement créé au début et supprimé à la fin de chaque session de tests.