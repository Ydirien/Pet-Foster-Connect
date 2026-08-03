import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { haversineDistanceKm } from "../lib/geo.ts";
import { buildSlug, parseIdFromSlug } from "../lib/slug.ts";

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