# Procédure de déploiement — Pet Foster Connect

## 1. Objectif du document

Ce document décrit la procédure permettant de préparer, tester et lancer **Pet Foster Connect** dans un environnement local reproductible avec Docker.

Pet Foster Connect est un **projet pédagogique** et n'a pas vocation à être publié sur un hébergement de production. Le déploiement présenté ici correspond donc à un environnement de **développement, de test et de démonstration**.

L'application est composée de quatre services :

- un client React / TypeScript avec Vite ;
- une API Node.js / Express ;
- une base de données PostgreSQL 17 ;
- Adminer pour consulter la base de données pendant le développement.

Docker Compose permet de lancer l'ensemble de ces services avec une configuration identique d'un poste à l'autre.

---

## 2. Prérequis

Les outils suivants doivent être installés :

- Git ;
- Docker Desktop avec Docker Compose ;
- Node.js 24 ou une version compatible avec le projet, uniquement si les tests sont lancés directement sur la machine.

Vérification rapide :

```bash
git --version
docker --version
docker compose version
node --version
npm --version
```

---

## 3. Récupération du projet

Récupérer le dépôt puis se placer dans le dossier du projet :

```bash
git clone https://github.com/Ydirien/Pet-Foster-Connect.git
cd Pet-Foster-Connect
```

Pour travailler à partir de la version principale :

```bash
git switch main
git pull origin main
```

---

## 4. Configuration des variables d'environnement

Le dépôt contient des fichiers `.env.example` servant de modèles.

Créer les fichiers locaux :

```bash
cp .env.example .env
cp api/.env.example api/.env
cp cli/.env.example cli/.env
```

Sous Windows PowerShell, les commandes équivalentes sont :

```powershell
Copy-Item .env.example .env
Copy-Item api/.env.example api/.env
Copy-Item cli/.env.example cli/.env
```

### Variables principales

Le fichier `.env` racine contient notamment :

```env
POSTGRES_USER=petfosterconnect
POSTGRES_PASSWORD=petfosterconnect
POSTGRES_DB=petfosterconnect
POSTGRES_LOCAL_PORT=5454

NODE_ENV=development
ACCESS_TOKEN_SECRET=your_access_token_secret
API_LOCAL_PORT=3010

ADMINER_LOCAL_PORT=8080

VITE_API_URL=http://localhost:3010/api
CLIENT_LOCAL_PORT=5173
```

Le secret JWT doit être remplacé par une valeur personnelle suffisamment longue avant le lancement de l'application.

Les fichiers `.env` contiennent des informations de configuration et ne doivent pas être ajoutés au dépôt Git.

---

## 5. Vérifications avant lancement

Avant de lancer l'environnement complet, les tests et les contrôles de compilation peuvent être exécutés.

### API

```bash
cd api
npm install
npm run typecheck
npm run lint
npm test
cd ..
```

Les tests de l'API utilisent une base PostgreSQL temporaire dédiée aux tests. Le serveur Express et la base de test sont démarrés puis supprimés automatiquement par la configuration de test.

### Front-end

```bash
cd cli
npm install
npm run lint
npm test
npm run build
cd ..
```

La commande `npm run build` vérifie également le typage TypeScript avant de générer le build Vite.

Ces vérifications permettent de détecter une régression avant le lancement de l'environnement Docker complet.

---

## 6. Lancement avec Docker Compose

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Cette commande :

1. construit l'image de l'API ;
2. construit l'image du client ;
3. démarre PostgreSQL ;
4. attend que PostgreSQL soit disponible grâce à son `healthcheck` ;
5. démarre l'API ;
6. applique les migrations Prisma au démarrage de l'API ;
7. démarre le client ;
8. démarre Adminer.

Pour vérifier l'état des conteneurs :

```bash
docker compose ps
```

Les services doivent apparaître comme démarrés. PostgreSQL doit également être indiqué comme sain (`healthy`).

---

## 7. Accès aux services

Avec les valeurs par défaut du fichier `.env.example` :

| Service | Adresse |
|---|---|
| Front-end | `http://localhost:5173` |
| API | `http://localhost:3010/api` |
| Adminer | `http://localhost:8080` |
| PostgreSQL | `localhost:5454` |

Le front-end communique avec l'API grâce à la variable :

```env
VITE_API_URL=http://localhost:3010/api
```

---

## 8. Migrations de base de données

Lors du démarrage du conteneur API, le script Docker exécute :

```bash
npx prisma migrate deploy
```

Cette commande applique les migrations Prisma présentes dans le dépôt avant le lancement de l'API.

Pour vérifier l'état des migrations manuellement :

```bash
docker compose exec api npx prisma migrate status
```

Le projet contient également un script de données de démonstration. Si nécessaire :

```bash
docker compose exec api npm run db:seed
```

Le seed ne doit être exécuté que lorsqu'un jeu de données de démonstration est souhaité.

### Sauvegarde et restauration

Pour sauvegarder la base de données depuis le conteneur PostgreSQL :

```bash
docker compose exec db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql
```

Pour restaurer une sauvegarde sur une base vide :

```bash
cat backup.sql | docker compose exec -T db psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

---

## 9. Vérifications fonctionnelles après lancement

Après le démarrage, quelques contrôles simples permettent de vérifier que l'application fonctionne correctement :

1. ouvrir la page d'accueil ;
2. vérifier que la liste des animaux est accessible ;
3. créer ou utiliser un compte famille d'accueil ;
4. vérifier la connexion ;
5. consulter une fiche animal ;
6. envoyer une demande d'accueil ;
7. se connecter avec un compte association ;
8. consulter les demandes reçues ;
9. accepter ou refuser une demande ;
10. vérifier la mise à jour du statut de la demande et de l'animal.

Ces contrôles complètent les tests automatisés par une vérification du parcours utilisateur principal.

---

## 10. Consultation des logs

Pour suivre les logs de tous les services :

```bash
docker compose logs -f
```

Pour afficher uniquement les logs de l'API :

```bash
docker compose logs -f api
```

Pour PostgreSQL :

```bash
docker compose logs -f db
```

Les logs permettent notamment d'identifier :

- une erreur de connexion à PostgreSQL ;
- une migration Prisma en échec ;
- une variable d'environnement manquante ;
- une erreur au démarrage de l'API ;
- une erreur HTTP côté serveur.

---

## 11. Arrêt et reconstruction

Pour arrêter les conteneurs sans supprimer les données PostgreSQL :

```bash
docker compose down
```

Le volume `db_data` est conservé.

Pour reconstruire l'application après une modification des dépendances ou des Dockerfiles :

```bash
docker compose down
docker compose up -d --build
```

La commande suivante supprime également les volumes et donc les données locales :

```bash
docker compose down -v
```

Elle ne doit être utilisée que lorsqu'une remise à zéro complète de l'environnement est souhaitée.

---

## 12. Environnements utilisés

### Environnement de développement

Le développeur peut lancer séparément le client et l'API avec les scripts `npm run dev`.

Le client est alors servi par Vite et l'API par Node.js / Express.

### Environnement de test

L'API possède un environnement de test isolé utilisant une base PostgreSQL temporaire. Les tests unitaires et d'intégration sont exécutés avec le Node.js Test Runner.

Le front-end utilise Vitest et Testing Library.

### Environnement d'intégration continue

GitHub Actions exécute automatiquement :

- les tests de l'API ;
- les tests du front-end ;
- le build du front-end.

Le workflow est déclenché lors des push sur `main` et des Pull Requests vers `main`.

### Environnement de démonstration

Docker Compose lance l'ensemble de l'application localement afin de reproduire l'architecture complète : client, API, PostgreSQL et Adminer.

### Environnement de production

Aucun environnement de production n'est mis en place car Pet Foster Connect est un projet pédagogique qui n'a pas vocation à être publié.

Le Dockerfile du client utilise actuellement le serveur de développement Vite. Dans le cas d'un véritable déploiement en production, le client serait d'abord compilé avec `npm run build`, puis les fichiers statiques générés seraient servis par un serveur HTTP adapté.

---

## 13. Sécurité liée au déploiement

Plusieurs précautions doivent être respectées lors de la configuration de l'environnement :

- ne jamais versionner les fichiers `.env` ;
- utiliser un `ACCESS_TOKEN_SECRET` différent de la valeur d'exemple ;
- limiter `ALLOWED_ORIGINS` aux domaines autorisés dans un environnement public ;
- ne pas utiliser `ALLOWED_ORIGINS=*` en production ;
- ne pas exposer Adminer publiquement dans un environnement de production ;
- utiliser HTTPS pour un éventuel déploiement public ;
- maintenir Node.js, PostgreSQL, Prisma et les dépendances du projet à jour ;
- consulter régulièrement les alertes de sécurité des dépendances, via `npm audit` et les alertes GitHub Dependabot du dépôt.

Dans le cadre actuel du projet, l'environnement reste local et destiné à la démonstration.

---

## 14. Procédure synthétique

La procédure complète peut être résumée ainsi :

```bash
git switch main
git pull origin main

# Configuration des fichiers .env

cd api
npm install
npm run typecheck
npm run lint
npm test
cd ..

cd cli
npm install
npm run lint
npm test
npm run build
cd ..

docker compose up -d --build
docker compose ps
docker compose exec api npx prisma migrate status
```

Une fois ces étapes terminées, l'application peut être vérifiée dans le navigateur sur `http://localhost:5173`.

---

## 15. Conclusion

La procédure de déploiement de Pet Foster Connect repose sur Docker et Docker Compose afin de fournir un environnement reproductible et simple à lancer.

Les tests automatisés sont exécutés avant le lancement, PostgreSQL est contrôlé par un `healthcheck`, les migrations Prisma sont appliquées automatiquement et les différents services peuvent être contrôlés grâce aux commandes Docker Compose.

Le projet n'étant pas destiné à une publication réelle, cette procédure constitue principalement une préparation au déploiement et un environnement complet de démonstration. Elle pourrait être adaptée à une mise en production ultérieure en ajoutant notamment un hébergement, HTTPS, une gestion de secrets de production et un serveur HTTP dédié au build statique du client.
