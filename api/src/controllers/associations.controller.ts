import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { haversineDistanceKm } from "../lib/geo.ts";
import { buildSlug, parseIdFromSlug } from "../lib/slug.ts";
import { parseIdFromParams, parseSlugParam } from "./utils.ts";
import { NotFoundError, ForbiddenError, BadRequestError } from "../lib/errors.ts";
import { saveOptimizedProfileImage, isOwnProcessedImageUrl } from "../lib/image-processing.ts";
import { geocoder } from "../lib/geocoder.ts";


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

// PUT /api/associations/:id : réservé à l'association propriétaire.
export async function updateAssociation(req: Request, res: Response) {
    const associationId = await parseIdFromParams(req.params.id);

    const profileImageUrlSchema = z
        .url()
        .max(255)
        .refine((url) => isOwnProcessedImageUrl(url, "profiles"), {
            message: "L'image doit provenir de POST /api/associations/upload",
        });

    // Le SIRET et l'email ne sont pas modifiables ici.
    const updateAssociationSchema = z.object({
        name: z.string().min(1).max(150).optional(),
        imageUrl: profileImageUrlSchema.optional(),
        description: z.string().optional(),
        address: z.string().max(150).optional(),
        city: z.string().min(1).max(100).optional(),
        postalCode: z.string().max(10).optional(),
        openingHours: z.string().optional(),
    });

    const data = await updateAssociationSchema.parseAsync(req.body);

    const association = await prisma.association.findUnique({
        where: { userId: associationId },
    });
    if (!association) throw new NotFoundError("Association introuvable");

    if (association.userId !== req.user.id) {
        throw new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource");
    }

    // Re-géocode uniquement si la ville ou le code postal changent réellement
    // (évite un appel réseau inutile sur chaque modif de description/horaires).
    const cityChanged = data.city !== undefined && data.city !== association.city;
    const postalCodeChanged = data.postalCode !== undefined && data.postalCode !== association.postalCode;

    const coordinates =
        cityChanged || postalCodeChanged
            ? await geocoder.geocode(data.city ?? association.city, data.postalCode ?? association.postalCode)
            : null;

    const updated = await prisma.association.update({
        where: { userId: associationId },
        data: {
            ...data,
            ...(coordinates && { latitude: coordinates.latitude, longitude: coordinates.longitude }),
        },
    });

    res.json({ ...updated, slug: buildSlug(updated.userId, updated.name) });
}