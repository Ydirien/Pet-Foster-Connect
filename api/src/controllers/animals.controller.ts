import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { NotFoundError, ForbiddenError, BadRequestError } from "../lib/errors.ts";

type AgeCategory = "puppy" | "adult" | "senior";

const AGE_CATEGORY_RANGES: Record<AgeCategory, { gte?: number; lt?: number; gt?: number }> = {
    puppy: { lt: 1 },
    adult: { gte: 1, lt: 8 },
    senior: { gt: 7 },
};

// Vérifie que tous les ids d'espèces référencés existent, sinon 400
// (message explicite plutôt qu'une erreur de clé étrangère Prisma).
async function assertSpeciesExist(ids: number[]) {
    if (ids.length === 0) return;
    const found = await prisma.species.findMany({ where: { id: { in: ids } } });
    if (found.length !== new Set(ids).size) {
        throw new BadRequestError("Espèce inconnue");
    }
}

// Charge l'animal et vérifie la propriété : 404 s'il n'existe pas,
// 403 si l'association connectée n'en est pas propriétaire.
async function getOwnedAnimal(animalId: number, requesterId: number) {
    const animal = await prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal) throw new NotFoundError("Animal introuvable");
    if (animal.associationId !== requesterId) {
        throw new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource");
    }
    return animal;
}