# Choix et justification de l'architecture

Pet Foster Connect utilise une architecture séparée en trois parties : **frontend**, **backend** et **base de données**.

```text
Utilisateur
    ↓
Frontend React
    ↓
API Express
    ↓
Prisma
    ↓
PostgreSQL
```

## Frontend

Le frontend se trouve dans le dossier `cli/` et est développé avec **React et TypeScript**.

J'ai choisi de séparer le frontend du backend pour que toute la partie affichage et navigation soit indépendante de la logique serveur. Le frontend récupère les données en faisant des requêtes vers l'API.

React permet aussi de découper l'interface en composants réutilisables, ce qui est pratique pour les différentes pages de l'application.

## Backend

Le backend se trouve dans le dossier `api/` et utilise **Node.js, Express et TypeScript**.

Il expose une API qui permet au frontend d'accéder aux différentes fonctionnalités : authentification, utilisateurs, animaux, associations et demandes d'accueil.

Le code est séparé en plusieurs dossiers comme les `routes`, `controllers`, `middlewares` et `models`. Cette organisation permet d'éviter de mettre toute la logique dans les mêmes fichiers et rend le projet plus simple à maintenir.

## Base de données

La base de données utilisée est **PostgreSQL**.

Le projet contient plusieurs données liées entre elles : utilisateurs, associations, familles d'accueil, animaux, espèces et demandes d'accueil. Une base de données relationnelle était donc adaptée au projet.

J'utilise **Prisma** pour faire le lien entre l'API et PostgreSQL. Le schéma Prisma permet de définir les tables, les relations et certaines contraintes directement dans le projet.

## Organisation générale

Les trois parties sont séparées mais fonctionnent ensemble :

1. L'utilisateur effectue une action depuis le frontend.
2. Le frontend envoie une requête à l'API.
3. L'API vérifie et traite la demande.
4. Prisma permet de lire ou modifier les données dans PostgreSQL.
5. L'API renvoie une réponse au frontend qui met ensuite l'interface à jour.

Le projet utilise également **Docker Compose** pour lancer séparément la base de données, l'API et le frontend tout en les faisant communiquer sur le même environnement.
