# Pet Foster Connect

[![CI - Tests and quality](https://github.com/Ydirien/Pet-Foster-Connect/actions/workflows/ci.yml/badge.svg)](https://github.com/Ydirien/Pet-Foster-Connect/actions/workflows/ci.yml)

Plateforme web mettant en relation des **associations de protection animale** et des **familles d'accueil** pour l'accueil temporaire d'animaux (chiens, chats, etc.) en attente d'adoption.

Les associations publient des fiches animaux, et les familles d'accueil créent un profil (logement, expérience, disponibilités) puis envoient des demandes d'accueil que les associations peuvent accepter ou refuser.

## Fonctionnalités

- Authentification (inscription, connexion, déconnexion, mot de passe oublié / réinitialisation) avec sessions par tokens (access + refresh)
- Deux types de comptes : **famille d'accueil** et **association**, chacun avec son propre profil
- Publication, modification et suppression de fiches animaux (par les associations), avec upload de photo
- Recherche et filtrage des animaux (espèce, ville + rayon géographique, etc.)
- Annuaire des associations avec page de détail
- Demandes d'accueil : envoi par les familles, suivi ("Mes demandes"), gestion par les associations ("Demandes reçues"), consultation du profil du candidat
- Pages légales (mentions légales, politique de confidentialité)

## Stack technique

| Composant | Techno |
|---|---|
| Frontend (`cli/`) | React 19, TypeScript, Vite, React Router |
| Backend (`api/`) | Node.js, Express 5, TypeScript, Prisma (PostgreSQL) |
| Base de données | PostgreSQL 17 |
| Auth | JWT (access/refresh tokens), Argon2 pour le hash des mots de passe |
| Autres | Zod (validation), Helmet, express-rate-limit, express-xss-sanitizer, Winston (logs), Sharp (traitement d'images) |
| Infra | Docker / Docker Compose (db, api, front, adminer) |

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- Node.js 24+ (si vous préférez lancer les services hors Docker)

## Démarrage rapide (Docker)

1. Copier les fichiers d'environnement d'exemple :

   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   cp cli/.env.example cli/.env
   ```

2. Compléter les variables nécessaires (notamment `ACCESS_TOKEN_SECRET` dans `api/.env`).

3. Lancer l'ensemble des services :

   ```bash
   docker compose up --build
   ```

4. Accéder aux services :

   - Frontend : http://localhost:5173
   - API : http://localhost:3010/api (port configurable via `API_LOCAL_PORT`)
   - Adminer (gestion de la base) : http://localhost:8080

Au premier démarrage, l'API applique automatiquement les migrations Prisma (`prisma migrate deploy`).

## Développement sans Docker

### API (`api/`)

```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend (`cli/`)

```bash
cd cli
npm install
npm run dev
```

## Scripts utiles

**API**

- `npm run dev` – démarre l'API en mode watch
- `npm test` – lance les tests (Node test runner)
- `npm run lint` – lint (Oxlint)
- `npm run typecheck` – vérification TypeScript
- `npm run db:migrate` – applique les migrations Prisma en dev
- `npm run db:seed` – peuple la base avec des données de démo

**Frontend**

- `npm run dev` – démarre le serveur de développement Vite
- `npm run build` – build de production
- `npm run lint` – lint (Oxlint)

## Structure du projet

```
.
├── api/            # Backend Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── lib/
│   └── prisma/     # Schéma, migrations, seed
├── cli/            # Frontend React + Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── services/
└── docker-compose.yml
```
