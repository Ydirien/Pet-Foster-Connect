import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { NotFoundError, ForbiddenError, ConflictError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

// Une demande est "active" tant qu'elle est en attente ou acceptée :
// c'est la base de la règle anti-doublon.
const ACTIVE_STATUSES = ["pending", "accepted"] as const;

export async function createFosterRequest(req: Request, res: Response) {
    const createFosterRequestSchema = z.object({
        animalId: z.number().int().positive(),
        message: z.string().max(2000).optional(),
    });

    const input = await createFosterRequestSchema.parseAsync(req.body);

    const animal = await prisma.animal.findUnique({ where: { id: input.animalId } });
    if (!animal) throw new NotFoundError("Animal introuvable");

    // Règle métier : pas de nouvelle demande sur un animal qui n'est plus disponible.
    if (animal.status !== "available") {
        throw new ConflictError("Cet animal n'est plus disponible pour l'accueil");
    }

    // Règle anti-doublon : aucune demande active pour ce couple famille d'accueil/animal.
    const existingActive = await prisma.fosterRequest.findFirst({
        where: {
            fosterId: req.user.id,
            animalId: input.animalId,
            status: { in: [...ACTIVE_STATUSES] },
        },
    });
    if (existingActive) {
        throw new ConflictError("Une demande active existe déjà pour cet animal");
    }

    const request = await prisma.fosterRequest.create({
        data: {
            fosterId: req.user.id,
            animalId: input.animalId,
            message: input.message ?? null,
        },
        include: { animal: true },
    });

    res.status(201).json(request);
}

// GET /api/demandes : filtré selon le rôle connecté.
export async function listFosterRequests(req: Request, res: Response) {
    if (req.user.role === "foster") {
        const requests = await prisma.fosterRequest.findMany({
            where: { fosterId: req.user.id },
            include: { animal: true },
        });
        res.json(requests);
        return;
    }

    const requests = await prisma.fosterRequest.findMany({
        where: { animal: { associationId: req.user.id } },
        include: {
            animal: true,
            // Identité minimale pour l'affichage liste ; le profil complet reste
            // derrière GET /api/users/:id (lui-même gated par la FosterRequest).
            foster: { select: { firstName: true, lastName: true, imageUrl: true } },
        },
    });
    res.json(requests);
}

// Accessible uniquement aux deux parties concernées par la demande.
export async function getFosterRequestDetail(req: Request, res: Response) {
    const requestId = await parseIdFromParams(req.params.id);

    const request = await prisma.fosterRequest.findUnique({
        where: { id: requestId },
        include: { animal: true },
    });
    if (!request) throw new NotFoundError("Demande introuvable");

    const isFosterConcerned = req.user.role === "foster" && request.fosterId === req.user.id;
    const isAssociationConcerned =
        req.user.role === "association" && request.animal.associationId === req.user.id;

    if (!isFosterConcerned && !isAssociationConcerned) {
        throw new ForbiddenError("Vous n'êtes pas concerné par cette demande");
    }

    res.json(request);
}

// Accepter/refuser une demande — réservé à l'association propriétaire de l'animal.
export async function updateFosterRequestStatus(req: Request, res: Response) {
    const requestId = await parseIdFromParams(req.params.id);

    const updateFosterRequestStatusSchema = z.object({
        // L'association ne peut que accepter ou refuser : "pending" n'est pas
        // réatteignable, et "cancelled" est réservé à la famille d'accueil.
        status: z.enum(["accepted", "rejected"]),
    });
    const { status } = await updateFosterRequestStatusSchema.parseAsync(req.body);

    const request = await prisma.fosterRequest.findUnique({
        where: { id: requestId },
        include: { animal: true },
    });
    if (!request) throw new NotFoundError("Demande introuvable");

    if (request.animal.associationId !== req.user.id) {
        throw new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource");
    }

    if (request.status !== "pending") {
        throw new ConflictError("Cette demande a déjà été traitée");
    }

    if (status === "rejected") {
        const updated = await prisma.fosterRequest.update({
            where: { id: requestId },
            data: { status },
            include: { animal: true },
        });
        res.json(updated);
        return;
    }

    // Acceptation : l'animal passe en accueil et toutes les autres demandes
    // actives sur ce même animal deviennent caduques -> rejected.
    const accepted = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.fosterRequest.update({
            where: { id: requestId },
            data: { status: "accepted" },
            include: { animal: true },
        });

        await tx.animal.update({
            where: { id: request.animalId },
            data: { status: "in_foster_care" },
        });

        await tx.fosterRequest.updateMany({
            where: {
                animalId: request.animalId,
                status: "pending",
                NOT: { id: requestId },
            },
            data: { status: "rejected" },
        });

        return updatedRequest;
    });

    res.json(accepted);
}

// La famille d'accueil peut annuler sa demande uniquement tant qu'elle est pending.
export async function cancelFosterRequest(req: Request, res: Response) {
    const requestId = await parseIdFromParams(req.params.id);

    const request = await prisma.fosterRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundError("Demande introuvable");

    if (request.fosterId !== req.user.id) {
        throw new ForbiddenError("Vous n'êtes pas propriétaire de cette ressource");
    }

    if (request.status !== "pending") {
        throw new ConflictError("Seules les demandes en attente peuvent être annulées");
    }

    await prisma.fosterRequest.update({
        where: { id: requestId },
        data: { status: "cancelled" },
    });

    res.status(204).end();
}