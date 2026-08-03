import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { haversineDistanceKm } from "../lib/geo.ts";
import { buildSlug, parseIdFromSlug } from "../lib/slug.ts";
import { parseIdFromParams, parseSlugParam } from "./utils.ts";
import { NotFoundError, ForbiddenError, BadRequestError } from "../lib/errors.ts";
import { saveOptimizedProfileImage, isOwnProcessedImageUrl } from "../lib/image-processing.ts";


// GET /api/associations : recherche par ville + rayon (façon Leboncoin), les
// trois paramètres doivent être fournis ensemble, sinon ils sont ignorés.
export async function listAssociations(req: Request, res: Response) {
    const listAssociationsQuerySchema = z.object({
        lat: z.coerce.number().min(-90).max(90).optional(),
        lng: z.coerce.number().min(-180).max(180).optional(),
        radiusKm: z.coerce.number().positive().max(500).optional(),
    });

    const filters = await listAssociationsQuerySchema.parseAsync(req.query);

    const associations = await prisma.association.findMany();

    const withinRadius =
        filters.lat !== undefined && filters.lng !== undefined && filters.radiusKm !== undefined
            ? associations.filter((association) => {
                    const { latitude, longitude } = association;
                    if (latitude === null || longitude === null) return false;
                    const distance = haversineDistanceKm(
                        { latitude: filters.lat!, longitude: filters.lng! },
                        { latitude, longitude },
                    );
                    return distance <= filters.radiusKm!;
                })
            : associations;

    res.json(
        withinRadius.map((association) => ({
            ...association,
            slug: buildSlug(association.userId, association.name),
        })),
    );
}

// GET /api/associations/:slug : détail public, inclut les animaux disponibles.
export async function getAssociationDetail(req: Request, res: Response) {
    const slug = parseSlugParam(req.params.slug);
    const id = parseIdFromSlug(slug);
    if (id === null) throw new NotFoundError("Association introuvable");

    const association = await prisma.association.findUnique({
        where: { userId: id },
        include: {
            animals: {
                where: { status: "available" },
                include: { species: true },
            },
            user: { select: { email: true, phone: true } },
        },
    });
    if (!association) throw new NotFoundError("Association introuvable");

    res.json({
        ...association,
        slug: buildSlug(association.userId, association.name),
        animals: association.animals.map((animal) => ({
            ...animal,
            slug: buildSlug(animal.id, animal.name),
        })),
    });
}

// req.file est fourni par le middleware uploadProfileImage (multer), en amont.
export async function uploadImage(req: Request, res: Response) {
    let relativePath: string;
    try {
        relativePath = await saveOptimizedProfileImage(req.file!.buffer);
    } catch {
        throw new BadRequestError("Fichier image invalide ou corrompu");
    }

    const imageUrl = `${req.protocol}://${req.get("host")}${relativePath}`;
    res.status(201).json({ imageUrl });
}