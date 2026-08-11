# Technologies utilisées

## Frontend

| Technologie | Utilisation | Pourquoi ce choix ? |
|---|---|---|
| **React** | Création des interfaces utilisateur | Permet de créer des composants réutilisables et de construire une interface dynamique. |
| **TypeScript** | Développement du frontend | Ajoute le typage à JavaScript et aide à éviter certaines erreurs pendant le développement. |
| **Vite** | Lancement et build du frontend | Outil simple et rapide pour développer une application React. |
| **React Router** | Gestion de la navigation | Permet de gérer les différentes pages et routes côté frontend. |
| **Lucide React** | Icônes de l'interface | Permet d'utiliser facilement des icônes cohérentes dans toute l'application. |

## Backend

| Technologie | Utilisation | Pourquoi ce choix ? |
|---|---|---|
| **Node.js** | Exécution du serveur | Permet d'utiliser JavaScript / TypeScript également côté serveur. |
| **Express** | Création de l'API | Framework léger qui permet de créer simplement les routes et middlewares de l'API. |
| **TypeScript** | Développement du backend | Permet d'avoir un code mieux typé et plus simple à maintenir. |
| **Zod** | Validation des données | Sert à vérifier les données reçues par l'API avant de les traiter. |
| **JWT** | Authentification | Utilisé pour gérer les jetons d'accès des utilisateurs connectés. |
| **Argon2** | Sécurité des mots de passe | Utilisé pour hacher les mots de passe avant leur enregistrement en base de données. |
| **Helmet** | Sécurité HTTP | Ajoute plusieurs en-têtes HTTP de sécurité à l'application Express. |
| **express-rate-limit** | Limitation des requêtes | Permet de limiter le nombre de requêtes sur certaines routes sensibles. |
| **express-xss-sanitizer** | Protection des entrées | Permet de nettoyer certaines données reçues afin de limiter les risques liés aux scripts injectés. |
| **Multer** | Upload de fichiers | Utilisé pour recevoir les images envoyées depuis les formulaires. |
| **Sharp** | Traitement des images | Permet de redimensionner et optimiser les images envoyées sur l'application. |
| **Winston** | Logs | Utilisé pour enregistrer les informations et erreurs du serveur. |

## Base de données

| Technologie | Utilisation | Pourquoi ce choix ? |
|---|---|---|
| **PostgreSQL** | Base de données relationnelle | Les données du projet sont fortement liées entre elles, par exemple les utilisateurs, animaux, associations et demandes d'accueil. |
| **Prisma** | ORM | Permet de définir le schéma de la base et d'effectuer les requêtes depuis l'API sans écrire toutes les requêtes SQL manuellement. |
| **Adminer** | Administration de la base | Permet de consulter et modifier facilement la base de données pendant le développement. |

## Tests et qualité du code

| Technologie | Utilisation | Pourquoi ce choix ? |
|---|---|---|
| **Vitest** | Tests du frontend | S'intègre facilement avec Vite et permet de tester les composants et fonctions du frontend. |
| **Testing Library** | Tests des composants React | Permet de tester les composants en reproduisant les actions d'un utilisateur. |
| **Node Test Runner** | Tests du backend | Permet d'exécuter les tests de l'API directement avec Node.js. |
| **Oxlint** | Analyse du code | Permet de détecter rapidement certaines erreurs et problèmes de qualité dans le code. |

## Environnement et outils

| Technologie | Utilisation | Pourquoi ce choix ? |
|---|---|---|
| **Docker** | Conteneurisation | Permet d'avoir le même environnement de développement sur différentes machines. |
| **Docker Compose** | Lancement des services | Permet de lancer le frontend, l'API, PostgreSQL et Adminer ensemble. |
| **Git** | Versionnement | Permet de suivre les modifications du code et de travailler avec plusieurs branches. |
| **GitHub** | Hébergement du dépôt | Utilisé pour stocker le projet et faciliter le travail en équipe. |
| **Visual Studio Code** | Environnement de développement | Éditeur utilisé pour développer et organiser le projet. |

L'ensemble de cette stack permet de garder une séparation claire entre le frontend, le backend et la base de données tout en utilisant principalement TypeScript sur le projet.
