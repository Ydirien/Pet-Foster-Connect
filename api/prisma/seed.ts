import argon2 from "argon2";
import { prisma } from "../src/models/index.ts";

// Référentiel des espèces (idempotent : upsert par nom unique).
const SPECIES = [
    "Chien",
    "Chat",
    "Lapin",
    "Rongeur",
    "Oiseau",
    "Furet",
    "Reptile",
];

for (const name of SPECIES) {
    await prisma.species.upsert({
        where: { name },
        update: {},
        create: { name },
    });
}

console.info(`✅ Seed terminé : ${SPECIES.length} espèces`);

// ---------------------------------------------------------------------------
// Association de test + chiens disponibles à l'adoption (pour tester le front).
// ---------------------------------------------------------------------------

const TEST_ASSOCIATION_EMAIL = "spa.lyon@example.com";
const TEST_ASSOCIATION_PASSWORD = "AssociationTest1";

const chien = await prisma.species.findUniqueOrThrow({ where: { name: "Chien" } });

const passwordHash = await argon2.hash(TEST_ASSOCIATION_PASSWORD);

const associationUser = await prisma.user.upsert({
    where: { email: TEST_ASSOCIATION_EMAIL },
    update: {},
    create: {
        email: TEST_ASSOCIATION_EMAIL,
        password: passwordHash,
        phone: "0472000000",
        association: {
            create: {
                name: "Refuge des Pattes Lyonnaises",
                siret: "12345678900019",
                description:
                    "Association loi 1901 basée à Lyon, dédiée au sauvetage et à la prise en charge temporaire d'animaux abandonnés en attendant leur adoption définitive.",
                address: "12 rue des Refuges",
                city: "Lyon",
                postalCode: "69000",
                openingHours: "Lundi - vendredi : 9h00 - 18h00\nSamedi : 10h00 - 16h00",
                latitude: 45.75,
                longitude: 4.85,
            },
        },
    },
    include: { association: true },
});

if (associationUser.association && associationUser.association.latitude === null) {
    await prisma.association.update({
        where: { userId: associationUser.id },
        data: { latitude: 45.75, longitude: 4.85 },
    });
}

const DOGS = [
    {
        name: "Rex",
        breed: "Berger Allemand",
        gender: "male" as const,
        neutered: false,
        age: 3,
        behavior: "Joueur et protecteur, Rex a besoin d'une famille active avec un grand jardin.",
        specificNeeds: "Promenades quotidiennes d'au moins 1h.",
    },
    {
        name: "Luna",
        breed: "Labrador",
        gender: "female" as const,
        neutered: true,
        age: 2,
        behavior: "Très douce et sociable, s'entend bien avec les enfants et les autres chiens.",
        specificNeeds: null,
    },
    {
        name: "Max",
        breed: "Golden Retriever",
        gender: "male" as const,
        neutered: true,
        age: 5,
        behavior: "Calme et affectueux, idéal pour une première adoption.",
        specificNeeds: "Alimentation spécifique (sensible digestif).",
    },
    {
        name: "Bella",
        breed: "Husky",
        gender: "female" as const,
        neutered: false,
        age: 1,
        behavior: "Très énergique, curieuse et têtue, a besoin d'une famille expérimentée.",
        specificNeeds: "Beaucoup d'exercice quotidien, ne supporte pas la solitude prolongée.",
    },
    {
        name: "Fido",
        breed: "Beagle",
        gender: "male" as const,
        neutered: true,
        age: 4,
        behavior: "Déjà en famille d'accueil depuis peu, ne cherche plus de candidat.",
        specificNeeds: null,
        status: "in_foster_care" as const,
    },
];

let createdCount = 0;
const createdDogs = new Map<string, number>();
for (const dog of DOGS) {
    const existing = await prisma.animal.findFirst({
        where: { name: dog.name, associationId: associationUser.id },
    });
    if (existing) {
        createdDogs.set(dog.name, existing.id);
        continue;
    }

    const created = await prisma.animal.create({
        data: {
            name: dog.name,
            breed: dog.breed,
            gender: dog.gender,
            neutered: dog.neutered,
            age: dog.age,
            behavior: dog.behavior,
            specificNeeds: dog.specificNeeds,
            status: dog.status ?? "available",
            speciesId: chien.id,
            associationId: associationUser.id,
        },
    });
    createdDogs.set(dog.name, created.id);
    createdCount++;
}

console.info(
    `✅ Seed terminé : association de test "${TEST_ASSOCIATION_EMAIL}" (mot de passe : ${TEST_ASSOCIATION_PASSWORD}), ${createdCount} chien(s) ajouté(s) sur ${DOGS.length}`,
);

// ---------------------------------------------------------------------------
// Famille d'accueil de test + demandes d'accueil couvrant les cas limites :
// une demande "pending" sur un animal encore disponible, et une demande
// "rejected" (montre qu'on peut re-demander après un refus, contrairement à
// un doublon sur une demande active).
// ---------------------------------------------------------------------------

const TEST_FOSTER_EMAIL = "camille.famille@example.com";
const TEST_FOSTER_PASSWORD = "FamilleTest1";

const fosterPasswordHash = await argon2.hash(TEST_FOSTER_PASSWORD);

const fosterUser = await prisma.user.upsert({
    where: { email: TEST_FOSTER_EMAIL },
    update: {},
    create: {
        email: TEST_FOSTER_EMAIL,
        password: fosterPasswordHash,
        phone: "0611223344",
        foster: {
            create: {
                firstName: "Camille",
                lastName: "Martin",
                city: "Lyon",
                postalCode: "69000",
                housingType: "house",
                hasGarden: true,
                gardenSize: 200,
                experienceLevel: "confirmed",
                monthlyBudget: 80,
            },
        },
    },
});

const rexId = createdDogs.get("Rex");
const lunaId = createdDogs.get("Luna");

let requestsCreatedCount = 0;

if (rexId !== undefined) {
    const existingPending = await prisma.fosterRequest.findFirst({
        where: { fosterId: fosterUser.id, animalId: rexId, status: "pending" },
    });
    if (!existingPending) {
        await prisma.fosterRequest.create({
            data: {
                fosterId: fosterUser.id,
                animalId: rexId,
                status: "pending",
                message: "Bonjour, j'ai un grand jardin clôturé et je suis disponible pour des promenades quotidiennes.",
            },
        });
        requestsCreatedCount++;
    }
}

if (lunaId !== undefined) {
    const existingRejected = await prisma.fosterRequest.findFirst({
        where: { fosterId: fosterUser.id, animalId: lunaId, status: "rejected" },
    });
    if (!existingRejected) {
        await prisma.fosterRequest.create({
            data: {
                fosterId: fosterUser.id,
                animalId: lunaId,
                status: "rejected",
                message: "Je travaille à domicile, je peux m'occuper de Luna toute la journée.",
            },
        });
        requestsCreatedCount++;
    }
}

console.info(
    `✅ Seed terminé : famille d'accueil de test "${TEST_FOSTER_EMAIL}" (mot de passe : ${TEST_FOSTER_PASSWORD}), ${requestsCreatedCount} demande(s) d'accueil ajoutée(s)`,
);

await prisma.$disconnect();