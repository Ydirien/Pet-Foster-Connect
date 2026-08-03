-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('available', 'in_foster_care', 'completed');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('house', 'apartment');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'confirmed', 'experienced');

-- CreateEnum
CREATE TYPE "WalkTime" AS ENUM ('less_than_30min', 'between_30min_1h', 'between_1h_2h', 'more_than_2h');

-- CreateEnum
CREATE TYPE "HomePresence" AS ENUM ('full_time', 'part_time', 'evenings_only', 'variable');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fosters" (
    "user_id" INTEGER NOT NULL,
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

    CONSTRAINT "fosters_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "associations" (
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "image_url" TEXT,
    "siret" VARCHAR(14),
    "description" TEXT,
    "address" VARCHAR(150),
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10),
    "opening_hours" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "associations_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_incompatible_species" (
    "animal_id" INTEGER NOT NULL,
    "species_id" INTEGER NOT NULL,

    CONSTRAINT "animal_incompatible_species_pkey" PRIMARY KEY ("animal_id","species_id")
);

-- CreateTable
CREATE TABLE "household_pets" (
    "id" SERIAL NOT NULL,
    "age" INTEGER,
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "foster_id" INTEGER NOT NULL,
    "species_id" INTEGER NOT NULL,

    CONSTRAINT "household_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foster_requests" (
    "id" SERIAL NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "foster_id" INTEGER NOT NULL,
    "animal_id" INTEGER NOT NULL,

    CONSTRAINT "foster_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "associations_siret_key" ON "associations"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "species_name_key" ON "species"("name");

-- AddForeignKey
ALTER TABLE "fosters" ADD CONSTRAINT "fosters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_incompatible_species" ADD CONSTRAINT "animal_incompatible_species_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_incompatible_species" ADD CONSTRAINT "animal_incompatible_species_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_pets" ADD CONSTRAINT "household_pets_foster_id_fkey" FOREIGN KEY ("foster_id") REFERENCES "fosters"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_pets" ADD CONSTRAINT "household_pets_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foster_requests" ADD CONSTRAINT "foster_requests_foster_id_fkey" FOREIGN KEY ("foster_id") REFERENCES "fosters"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foster_requests" ADD CONSTRAINT "foster_requests_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
