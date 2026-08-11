# Compte-rendu de tests — Pet Foster Connect

Résultats de la dernière exécution complète de la suite de tests, réalisée le 12/08/2026 en local (Windows, Docker Desktop, Node 24), suivant le plan de tests (`Docs/plan-de-tests.md`).

## Résumé

| Suite | Résultat |
|---|---|
| Tests API (intégration + unitaires + fuzzing) | 158 / 158 passés (35 suites) |
| Tests front (composants + services) | 25 / 25 passés (11 fichiers) |
| Lint (API et front) | Aucun signalement |
| Typecheck (API et front) | Aucune erreur |
| Test de charge | Tenu sans erreur (voir détail ci-dessous) |

## Tests d'intégration et unitaires (API)

Exécutés avec `npm test` dans `api/`, contre un conteneur PostgreSQL 17 jetable (`api/tests/config/global-setup.ts`).

```
tests 158
suites 35
pass 158
fail 0
cancelled 0
skipped 0
todo 0
duration_ms ~62500
```

## Tests front

Exécutés avec `npm test` dans `cli/` (Vitest + Testing Library).

```
Test Files  11 passed (11)
Tests       25 passed (25)
```

## Test de charge

Exécuté avec `npm run test:load` dans `api/`, contre l'API démarrée en local, sur `GET /api/animaux` :

| Indicateur | Valeur |
|---|---|
| Connexions simultanées | 10 |
| Durée | 10 secondes |
| Requêtes traitées | 6 127 |
| Requêtes/seconde (moyenne) | 612,71 |
| Latence moyenne | 15,82 ms |
| Latence p99 | 29 ms |
| Réponses 2xx | 6 127 |
| Réponses non-2xx | 0 |
| Erreurs de connexion | 0 |

L'API a tenu la charge sans aucune erreur ni ralentissement anormal.

## Tests de fuzzing — 2 bugs trouvés et corrigés

L'écriture des tests de fuzzing (`api/src/controllers/auth.controller.fuzz.spec.test.ts`) a mis en évidence 2 cas réels où l'API répondait 500 (erreur serveur générique) au lieu de 400 (erreur client) :

1. **Un octet nul dans un champ texte** (ex : `firstName`) faisait planter la requête Postgres (`invalid byte sequence for encoding "UTF8": 0x00`, code Prisma `P2039`), non rattrapée par le gestionnaire d'erreurs global.
2. **Un JSON mal formé dans le corps de la requête** faisait planter le parseur d'Express (`SyntaxError`, `entity.parse.failed`), non rattrapé non plus.

Les deux cas ont été corrigés dans `api/src/middlewares/global-error-handler.middleware.ts` : ces deux types d'erreurs sont désormais explicitement interceptés et renvoient une réponse 400 propre, sans exposer de détail technique au client. Les tests de fuzzing vérifient maintenant que ces deux cas précis, ainsi qu'une dizaine d'autres entrées volontairement absurdes (tableaux, nombres, chaînes de 100 000 caractères, emojis, tentative d'injection SQL, payload XSS), ne font jamais planter le serveur.

## Limites de cette campagne de tests

- Pas de mesure de couverture de code chiffrée.
- Le test de charge ne porte que sur une seule route publique en lecture (`GET /api/animaux`), pas sur l'ensemble de l'API ni sur les routes authentifiées.
- Les tests de fuzzing ciblent uniquement `POST /api/auth/register` ; le même principe pourrait être étendu aux autres routes publiques.
- Voir aussi `Docs/plan-de-tests.md` section 10 pour les fonctions de contrôleur sans test dédié.
