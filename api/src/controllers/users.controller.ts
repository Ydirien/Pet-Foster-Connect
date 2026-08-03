import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { NotFoundError, ForbiddenError, BadRequestError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";
import { saveOptimizedProfileImage, isOwnProcessedImageUrl } from "../lib/image-processing.ts";

export async function getCurrentUser(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
            foster: { include: { householdPets: { include: { species: true } } } },
            association: true,
        },
    });
    if (!user) throw new NotFoundError("Utilisateur introuvable");

    const role = user.foster ? "foster" : "association";

    res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        role,
        profile: role === "foster" ? user.foster : user.association,
    });
}

// req.file est fourni par le middleware uploadProfileImage (multer), en amont.
export async function uploadProfilePhoto(req: Request, res: Response) {
    let relativePath: string;
    try {
        relativePath = await saveOptimizedProfileImage(req.file!.buffer);
    } catch {
        throw new BadRequestError("Fichier image invalide ou corrompu");
    }

    const imageUrl = `${req.protocol}://${req.get("host")}${relativePath}`;
    res.status(201).json({ imageUrl });
}

// PUT /api/users/me : réservé à la famille d'accueil (checkRole("foster") en amont sur la route)
export async function updateFosterProfile(req: Request, res: Response) {
    const profileImageUrlSchema = z
        .url()
        .max(255)
        .refine((url) => isOwnProcessedImageUrl(url, "profiles"), {
            message: "L'image doit provenir de POST /api/users/me/photo",
        });

    const updateFosterProfileSchema = z.object({
        phone: z.string().max(20).optional(),
        firstName: z.string().min(1).max(50).optional(),
        lastName: z.string().min(1).max(50).optional(),
        imageUrl: profileImageUrlSchema.optional(),
        address: z.string().max(150).optional(),
        city: z.string().min(1).max(100).optional(),
        postalCode: z.string().max(10).optional(),
        housingType: z.enum(["house", "apartment"]).optional(),
        housingSize: z.number().int().min(0).optional(),
        hasGarden: z.boolean().optional(),
        gardenSize: z.number().int().min(0).optional(),
        walkTime: z.enum(["less_than_30min", "between_30min_1h", "between_1h_2h", "more_than_2h"]).optional(),
        homePresence: z.enum(["full_time", "part_time", "evenings_only", "variable"]).optional(),
        experienceLevel: z.enum(["beginner", "confirmed", "experienced"]).optional(),
        experienceDescription: z.string().optional(),
        monthlyBudget: z.number().min(0).max(9999.99).optional(),
    });

    const input = await updateFosterProfileSchema.parseAsync(req.body);

    const foster = await prisma.foster.findUnique({ where: { userId: req.user.id } });
    if (!foster) throw new NotFoundError("Profil introuvable");

    const { phone, ...fosterFields } = input;

    // Le téléphone est porté par User, le reste par le profil Foster.
    if (phone !== undefined) {
        await prisma.user.update({ where: { id: req.user.id }, data: { phone } });
    }

    const profile = await prisma.foster.update({
        where: { userId: req.user.id },
        data: fosterFields,
    });

    res.json({ id: req.user.id, role: "foster", profile });
}

export async function addHouseholdPet(req: Request, res: Response) {
    const addHouseholdPetSchema = z.object({
        speciesId: z.number().int().positive(),
        age: z.number().int().min(0).max(100).optional(),
        neutered: z.boolean().optional(),
    });

    const input = await addHouseholdPetSchema.parseAsync(req.body);

    const species = await prisma.species.findUnique({ where: { id: input.speciesId } });
    if (!species) throw new BadRequestError("Espèce inconnue");

    const pet = await prisma.householdPet.create({
        data: {
            fosterId: req.user.id,
            speciesId: input.speciesId,
            age: input.age ?? null,
            neutered: input.neutered ?? false,
        },
        include: { species: true },
    });

    res.status(201).json(pet);
}

export async function removeHouseholdPet(req: Request, res: Response) {
    const petId = await parseIdFromParams(req.params.petId);

    const pet = await prisma.householdPet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundError("Animal du foyer introuvable");

    if (pet.fosterId !== req.user.id) {
        throw new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource");
    }

    await prisma.householdPet.delete({ where: { id: petId } });
    res.status(204).end();
}

export async function deleteCurrentUser(req: Request, res: Response) {
    // Un animal publié référence son association en onDelete: Restrict : on
    // supprime d'abord ses animaux (cascade en base vers leurs demandes
    // d'accueil et espèces incompatibles) avant de supprimer le compte.
    await prisma.animal.deleteMany({ where: { associationId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(204).end();
}

// Vue du profil d'une famille d'accueil par une association qui évalue une
// demande. On vérifie d'abord qu'une demande relie bien les deux comptes.
export async function getFosterProfileForAssociation(req: Request, res: Response) {
    const fosterId = await parseIdFromParams(req.params.id);

    const linkingRequest = await prisma.fosterRequest.findFirst({
        where: {
            fosterId,
            animal: { associationId: req.user.id },
        },
    });
    if (!linkingRequest) {
        throw new ForbiddenError("Aucune demande d'accueil ne vous relie à cette famille d'accueil");
    }

    const foster = await prisma.foster.findUnique({
        where: { userId: fosterId },
        include: {
            householdPets: { include: { species: true } },
            user: { select: { email: true, phone: true, createdAt: true } },
        },
    });
    if (!foster) throw new NotFoundError("Famille d'accueil introuvable");

    res.json(foster);
}