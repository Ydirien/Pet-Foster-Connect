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