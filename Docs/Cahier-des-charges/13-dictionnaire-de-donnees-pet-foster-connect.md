# Dictionnaire de données

Ce dictionnaire liste les entités du projet et leurs attributs, à partir du schéma Prisma réellement utilisé (`api/prisma/schema.prisma`). Il complète le MCD, le MLD et le MPD en détaillant chaque attribut.

## Utilisateur (`users`)

Compte de connexion commun aux familles d'accueil et aux associations. Un utilisateur possède soit un profil `Foster`, soit un profil `Association`, jamais les deux.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant unique de l'utilisateur |
| email | String | Unique, non nul | Email de connexion |
| password | String | Non nul | Mot de passe haché (Argon2) |
| phone | String (20) | Optionnel | Numéro de téléphone |
| createdAt | DateTime | Non nul, défaut = maintenant | Date de création du compte |

## Famille d'accueil (`fosters`)

Profil complémentaire d'un utilisateur qui souhaite accueillir un animal.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| userId | Int | PK, FK → users.id | Lien vers le compte utilisateur |
| lastName | String (50) | Non nul | Nom |
| firstName | String (50) | Non nul | Prénom |
| imageUrl | Text | Optionnel | Photo de profil |
| address | String (150) | Optionnel | Adresse |
| city | String (100) | Non nul | Ville |
| postalCode | String (10) | Optionnel | Code postal |
| housingType | Enum HousingType | Optionnel | Type de logement (maison / appartement) |
| housingSize | Int | Optionnel | Surface du logement en m² |
| hasGarden | Boolean | Non nul, défaut faux | Présence d'un jardin |
| gardenSize | Int | Optionnel | Surface du jardin en m² |
| walkTime | Enum WalkTime | Optionnel | Temps de promenade disponible |
| homePresence | Enum HomePresence | Optionnel | Présence au domicile |
| experienceLevel | Enum ExperienceLevel | Optionnel | Niveau d'expérience avec les animaux |
| experienceDescription | Text | Optionnel | Description libre de l'expérience |
| monthlyBudget | Decimal(6,2) | Optionnel | Budget mensuel envisagé pour l'accueil |

## Association (`associations`)

Profil complémentaire d'un utilisateur représentant une association de protection animale.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| userId | Int | PK, FK → users.id | Lien vers le compte utilisateur |
| name | String (150) | Non nul | Nom de l'association |
| imageUrl | Text | Optionnel | Logo ou photo de l'association |
| siret | String (14) | Unique, optionnel | Numéro SIRET (facultatif, une petite structure peut ne pas en avoir) |
| description | Text | Optionnel | Présentation de l'association |
| address | String (150) | Optionnel | Adresse |
| city | String (100) | Non nul | Ville |
| postalCode | String (10) | Optionnel | Code postal |
| openingHours | Text | Optionnel | Horaires d'ouverture |
| latitude | Float | Optionnel | Latitude géocodée automatiquement à partir de l'adresse |
| longitude | Float | Optionnel | Longitude géocodée automatiquement à partir de l'adresse |

## Espèce (`species`)

Table de référence des espèces d'animaux gérées par la plateforme.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant de l'espèce |
| name | String (50) | Unique, non nul | Nom de l'espèce (ex : chien, chat) |

## Animal (`animals`)

Fiche d'un animal publiée par une association.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant de l'animal |
| name | String (100) | Non nul | Nom de l'animal |
| breed | String (50) | Optionnel | Race |
| gender | Enum Gender | Non nul | Sexe (mâle / femelle) |
| neutered | Boolean | Non nul, défaut faux | Animal stérilisé ou non |
| age | Int | Optionnel | Âge en années |
| behavior | Text | Optionnel | Comportement de l'animal |
| specificNeeds | Text | Optionnel | Besoins spécifiques |
| status | Enum AnimalStatus | Non nul, défaut `available` | Statut de l'animal dans le processus d'accueil |
| imageUrl | Text | Optionnel | Photo de l'animal |
| publishedAt | DateTime | Non nul, défaut = maintenant | Date de publication de la fiche |
| associationId | Int | FK → associations.userId | Association propriétaire de la fiche |
| speciesId | Int | FK → species.id | Espèce de l'animal |

## Espèce incompatible (`animal_incompatible_species`)

Table de jointure indiquant qu'un animal ne peut pas cohabiter avec certaines espèces.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| animalId | Int | PK composée, FK → animals.id | Animal concerné |
| speciesId | Int | PK composée, FK → species.id | Espèce incompatible avec cet animal |

## Animal du foyer (`household_pets`)

Animal déjà présent chez une famille d'accueil, hors plateforme, renseigné pour aider l'association à évaluer une candidature.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant de l'animal du foyer |
| age | Int | Optionnel | Âge de l'animal |
| neutered | Boolean | Non nul, défaut faux | Animal stérilisé ou non |
| fosterId | Int | FK → fosters.userId | Famille d'accueil propriétaire |
| speciesId | Int | FK → species.id | Espèce de l'animal |

## Demande d'accueil (`foster_requests`)

Demande envoyée par une famille d'accueil pour accueillir un animal.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant de la demande |
| requestedAt | DateTime | Non nul, défaut = maintenant | Date d'envoi de la demande |
| status | Enum RequestStatus | Non nul, défaut `pending` | Statut de la demande |
| message | Text | Optionnel | Message de la famille à l'association |
| fosterId | Int | FK → fosters.userId | Famille à l'origine de la demande |
| animalId | Int | FK → animals.id | Animal concerné par la demande |

Une seule demande active (`pending` ou `accepted`) peut exister à la fois pour un même couple famille / animal (contrainte imposée par un index unique partiel en base).

## Jeton de rafraîchissement (`refresh_tokens`)

Jeton permettant de renouveler la session d'un utilisateur connecté sans lui redemander son mot de passe.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant du jeton |
| token | String | Non nul | Valeur du jeton |
| userId | Int | FK → users.id | Utilisateur concerné |
| issuedAt | DateTime | Non nul, défaut = maintenant | Date d'émission |
| expiresAt | DateTime | Non nul | Date d'expiration |

## Jeton de réinitialisation de mot de passe (`password_reset_tokens`)

Jeton temporaire envoyé par email pour permettre à un utilisateur de choisir un nouveau mot de passe.

| Attribut | Type | Contrainte | Description |
|---|---|---|---|
| id | Int | PK, auto-incrémenté | Identifiant du jeton |
| token | String | Non nul | Valeur du jeton |
| userId | Int | FK → users.id | Utilisateur concerné |
| issuedAt | DateTime | Non nul, défaut = maintenant | Date d'émission |
| expiresAt | DateTime | Non nul | Date d'expiration |

## Valeurs des énumérations

| Énumération | Valeurs possibles | Utilisée par |
|---|---|---|
| Gender | male, female | Animal |
| AnimalStatus | available, in_foster_care, completed | Animal |
| RequestStatus | pending, accepted, rejected, cancelled | FosterRequest |
| HousingType | house, apartment | Foster |
| ExperienceLevel | beginner, confirmed, experienced | Foster |
| WalkTime | less_than_30min, between_30min_1h, between_1h_2h, more_than_2h | Foster |
| HomePresence | full_time, part_time, evenings_only, variable | Foster |
