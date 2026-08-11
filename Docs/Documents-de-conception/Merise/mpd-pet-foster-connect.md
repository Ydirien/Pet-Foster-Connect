# MPD — Pet Foster Connect

Le MPD correspond à l'implémentation physique de la base **PostgreSQL** utilisée par le projet.

```sql
CREATE TYPE "Gender" AS ENUM (
    'male',
    'female'
);

CREATE TYPE "AnimalStatus" AS ENUM (
    'available',
    'in_foster_care',
    'completed'
);

CREATE TYPE "RequestStatus" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'cancelled'
);

CREATE TYPE "HousingType" AS ENUM (
    'house',
    'apartment'
);

CREATE TYPE "ExperienceLevel" AS ENUM (
    'beginner',
    'confirmed',
    'experienced'
);

CREATE TYPE "WalkTime" AS ENUM (
    'less_than_30min',
    'between_30min_1h',
    'between_1h_2h',
    'more_than_2h'
);

CREATE TYPE "HomePresence" AS ENUM (
    'full_time',
    'part_time',
    'evenings_only',
    'variable'
);

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "fosters" (
    "user_id" INTEGER PRIMARY KEY,
    "last_name" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "image_url" TEXT,
    "address" VARCHAR(150),
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10),
    "housing_type" "HousingType",
    "housing_size" INTEGER,
    "has_garden" BOOLEAN NOT NULL DEFAULT false,
    "garden_size" INTEGER,
    "walk_time" "WalkTime",
    "home_presence" "HomePresence",
    "experience_level" "ExperienceLevel",
    "experience_description" TEXT,
    "monthly_budget" DECIMAL(6,2),

    FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
);

CREATE TABLE "associations" (
    "user_id" INTEGER PRIMARY KEY,
    "name" VARCHAR(150) NOT NULL,
    "image_url" TEXT,
    "siret" VARCHAR(14) UNIQUE,
    "description" TEXT,
    "address" VARCHAR(150),
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10),
    "opening_hours" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
);

CREATE TABLE "species" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE "animals" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "breed" VARCHAR(50),
    "gender" "Gender" NOT NULL,
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "behavior" TEXT,
    "specific_needs" TEXT,
    "status" "AnimalStatus" NOT NULL DEFAULT 'available',
    "image_url" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "association_id" INTEGER NOT NULL,
    "species_id" INTEGER NOT NULL,

    FOREIGN KEY ("association_id")
        REFERENCES "associations"("user_id")
        ON DELETE RESTRICT,

    FOREIGN KEY ("species_id")
        REFERENCES "species"("id")
        ON DELETE RESTRICT
);

CREATE TABLE "animal_incompatible_species" (
    "animal_id" INTEGER NOT NULL,
    "species_id" INTEGER NOT NULL,

    PRIMARY KEY ("animal_id", "species_id"),

    FOREIGN KEY ("animal_id")
        REFERENCES "animals"("id")
        ON DELETE CASCADE,

    FOREIGN KEY ("species_id")
        REFERENCES "species"("id")
        ON DELETE RESTRICT
);

CREATE TABLE "household_pets" (
    "id" SERIAL PRIMARY KEY,
    "age" INTEGER,
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "foster_id" INTEGER NOT NULL,
    "species_id" INTEGER NOT NULL,

    FOREIGN KEY ("foster_id")
        REFERENCES "fosters"("user_id")
        ON DELETE CASCADE,

    FOREIGN KEY ("species_id")
        REFERENCES "species"("id")
        ON DELETE RESTRICT
);

CREATE TABLE "foster_requests" (
    "id" SERIAL PRIMARY KEY,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "foster_id" INTEGER NOT NULL,
    "animal_id" INTEGER NOT NULL,

    FOREIGN KEY ("foster_id")
        REFERENCES "fosters"("user_id")
        ON DELETE CASCADE,

    FOREIGN KEY ("animal_id")
        REFERENCES "animals"("id")
        ON DELETE CASCADE
);

CREATE TABLE "refresh_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
);

CREATE TABLE "password_reset_tokens" (
    "id" SERIAL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX "foster_requests_active_unique"
ON "foster_requests" ("foster_id", "animal_id")
WHERE "status" IN ('pending', 'accepted');
```

Ce MPD reprend les types, clés, relations et contraintes réellement créés par les migrations Prisma du projet.
