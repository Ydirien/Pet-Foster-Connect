# MLD — Pet Foster Connect

Le MLD transforme le MCD en tables relationnelles avec les clés primaires et les clés étrangères.

```text
UTILISATEUR (
    id PK,
    email UQ,
    password,
    phone,
    created_at
)

FAMILLE_ACCUEIL (
    user_id PK, FK -> UTILISATEUR.id,
    last_name,
    first_name,
    image_url,
    address,
    city,
    postal_code,
    housing_type,
    housing_size,
    has_garden,
    garden_size,
    walk_time,
    home_presence,
    experience_level,
    experience_description,
    monthly_budget
)

ASSOCIATION (
    user_id PK, FK -> UTILISATEUR.id,
    name,
    image_url,
    siret UQ,
    description,
    address,
    city,
    postal_code,
    opening_hours,
    latitude,
    longitude
)

ESPECE (
    id PK,
    name UQ
)

ANIMAL (
    id PK,
    name,
    breed,
    gender,
    neutered,
    age,
    behavior,
    specific_needs,
    status,
    image_url,
    published_at,
    association_id FK -> ASSOCIATION.user_id,
    species_id FK -> ESPECE.id
)

ANIMAL_ESPECE_INCOMPATIBLE (
    animal_id PK, FK -> ANIMAL.id,
    species_id PK, FK -> ESPECE.id
)

ANIMAL_FOYER (
    id PK,
    age,
    neutered,
    foster_id FK -> FAMILLE_ACCUEIL.user_id,
    species_id FK -> ESPECE.id
)

DEMANDE_ACCUEIL (
    id PK,
    requested_at,
    status,
    message,
    foster_id FK -> FAMILLE_ACCUEIL.user_id,
    animal_id FK -> ANIMAL.id
)

REFRESH_TOKEN (
    id PK,
    token,
    user_id FK -> UTILISATEUR.id,
    issued_at,
    expires_at
)

PASSWORD_RESET_TOKEN (
    id PK,
    token,
    user_id FK -> UTILISATEUR.id,
    issued_at,
    expires_at
)
```

## Contraintes importantes

- `UTILISATEUR.email` est unique.
- `ASSOCIATION.siret` est unique lorsqu'il est renseigné.
- `ESPECE.name` est unique.
- La table `ANIMAL_ESPECE_INCOMPATIBLE` possède une clé primaire composée de `animal_id` et `species_id`.
- Une seule demande active peut exister pour un même couple famille / animal lorsque son statut est `pending` ou `accepted`.
