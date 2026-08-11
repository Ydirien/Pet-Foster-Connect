# Routes de l'API

Toutes les routes de l'API commencent par `/api`.

## Authentification

| Méthode | Route | Description | Accès |
|---|---|---|---|
| POST | `/api/auth/register` | Créer un compte | Public |
| POST | `/api/auth/login` | Se connecter | Public |
| POST | `/api/auth/logout` | Se déconnecter | Connecté |
| GET | `/api/auth/me` | Récupérer l'utilisateur connecté | Connecté |
| POST | `/api/auth/refresh` | Renouveler les jetons de connexion | Public |
| POST | `/api/auth/forgot-password` | Demander une réinitialisation du mot de passe | Public |
| POST | `/api/auth/reset-password` | Réinitialiser le mot de passe | Public |

## Utilisateurs

| Méthode | Route | Description | Accès |
|---|---|---|---|
| GET | `/api/users/me` | Consulter son profil | Connecté |
| POST | `/api/users/me/photo` | Ajouter ou modifier la photo d'une famille d'accueil | Famille |
| PUT | `/api/users/me` | Modifier le profil d'une famille d'accueil | Famille |
| POST | `/api/users/me/animaux-foyer` | Ajouter un animal déjà présent dans le foyer | Famille |
| DELETE | `/api/users/me/animaux-foyer/:petId` | Supprimer un animal du foyer | Famille |
| GET | `/api/users/:id` | Consulter le profil d'une famille candidate | Association |
| DELETE | `/api/users/me` | Supprimer son compte | Connecté |

## Animaux

| Méthode | Route | Description | Accès |
|---|---|---|---|
| GET | `/api/animaux` | Récupérer la liste des animaux | Public |
| GET | `/api/animaux/:slug` | Consulter le détail d'un animal | Public |
| POST | `/api/animaux/upload` | Envoyer la photo d'un animal | Association |
| POST | `/api/animaux` | Publier un animal | Association |
| PUT | `/api/animaux/:id` | Modifier un animal | Association |
| DELETE | `/api/animaux/:id` | Supprimer un animal | Association |

## Associations

| Méthode | Route | Description | Accès |
|---|---|---|---|
| GET | `/api/associations` | Récupérer la liste des associations | Public |
| GET | `/api/associations/:slug` | Consulter le détail d'une association | Public |
| POST | `/api/associations/upload` | Envoyer la photo d'une association | Association |
| PUT | `/api/associations/:id` | Modifier le profil d'une association | Association |

## Demandes d'accueil

| Méthode | Route | Description | Accès |
|---|---|---|---|
| POST | `/api/demandes` | Envoyer une demande d'accueil | Famille |
| GET | `/api/demandes` | Consulter les demandes liées au compte | Connecté |
| GET | `/api/demandes/:id` | Consulter le détail d'une demande | Connecté |
| PATCH | `/api/demandes/:id/status` | Modifier le statut d'une demande | Association |
| DELETE | `/api/demandes/:id` | Annuler une demande d'accueil | Famille |

## Espèces

| Méthode | Route | Description | Accès |
|---|---|---|---|
| GET | `/api/especes` | Récupérer la liste des espèces | Public |

Les routes protégées utilisent le système d'authentification de l'application. Certaines vérifient également le type de compte afin de réserver les actions aux familles d'accueil ou aux associations.
