import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { buildSlug, parseIdFromSlug } from "../lib/slug.ts";
import { haversineDistanceKm } from "../lib/geo.ts";
import { NotFoundError, ForbiddenError, BadRequestError } from "../lib/errors.ts";
import { parseIdFromParams, parseSlugParam } from "./utils.ts";
import { saveOptimizedAnimalImage, isOwnProcessedImageUrl } from "../lib/image-processing.ts";

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

// Public : liste filtrable (?speciesId=&city=&status=&gender=&neutered=&ageCategory=)
// et recherche par ville + rayon.
export async function listAnimals(req: Request, res: Response) {
    const listAnimalsQuerySchema = z.object({
        speciesId: z.coerce.number().int().positive().optional(),
        city: z.string().min(1).optional(),
        breed: z.string().min(1).optional(),
        status: z.enum(["available", "in_foster_care", "completed"]).optional(),
        associationId: z.coerce.number().int().positive().optional(),
        gender: z.enum(["male", "female"]).optional(),
        neutered: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
        ageCategory: z.enum(["puppy", "adult", "senior"]).optional(),
        // Recherche par ville + rayon (façon Leboncoin) : les trois doivent être
        // fournis ensemble, sinon ignorés.
        lat: z.coerce.number().min(-90).max(90).optional(),
        lng: z.coerce.number().min(-180).max(180).optional(),
        radiusKm: z.coerce.number().positive().max(500).optional(),
    });

    const filters = await listAnimalsQuerySchema.parseAsync(req.query);
    const ageRange = filters.ageCategory ? AGE_CATEGORY_RANGES[filters.ageCategory] : undefined;

    const animals = await prisma.animal.findMany({
        where: {
            ...(filters.speciesId !== undefined && { speciesId: filters.speciesId }),
            ...(filters.breed && { breed: { contains: filters.breed, mode: "insensitive" } }),
            ...(filters.status !== undefined && { status: filters.status }),
            ...(filters.associationId !== undefined && { associationId: filters.associationId }),
            ...(filters.gender !== undefined && { gender: filters.gender }),
            ...(filters.neutered !== undefined && { neutered: filters.neutered }),
            ...(ageRange && { age: ageRange }),
            ...(filters.city && {
                association: { city: { equals: filters.city, mode: "insensitive" } },
            }),
        },
        include: {
            species: true,
            association: {
                select: { userId: true, name: true, imageUrl: true, city: true, latitude: true, longitude: true },
            },
        },
    });

    const withinRadius =
        filters.lat !== undefined && filters.lng !== undefined && filters.radiusKm !== undefined
            ? animals.filter((animal) => {
                    const { latitude, longitude } = animal.association;
                    if (latitude === null || longitude === null) return false;
                    const distance = haversineDistanceKm(
                        { latitude: filters.lat!, longitude: filters.lng! },
                        { latitude, longitude },
                    );
                    return distance <= filters.radiusKm!;
                })
            : animals;

    const results = withinRadius.map((animal) => {
        const { latitude, longitude, ...associationRest } = animal.association;
        return {
            ...animal,
            slug: buildSlug(animal.id, animal.name),
            association: {
                ...associationRest,
                slug: buildSlug(animal.association.userId, animal.association.name),
            },
        };
    });

    res.json(results);
}

export async function getAnimalDetail(req: Request, res: Response) {
    const slug = parseSlugParam(req.params.slug);
    const id = parseIdFromSlug(slug);
    if (id === null) throw new NotFoundError("Animal introuvable");

    const animal = await prisma.animal.findUnique({
        where: { id },
        include: {
            species: true,
            association: { select: { userId: true, name: true, imageUrl: true, city: true } },
            incompatibleSpecies: { include: { species: true } },
        },
    });
    if (!animal) throw new NotFoundError("Animal introuvable");

    res.json({
        ...animal,
        slug: buildSlug(animal.id, animal.name),
        association: {
            ...animal.association,
            slug: buildSlug(animal.association.userId, animal.association.name),
        },
    });
}