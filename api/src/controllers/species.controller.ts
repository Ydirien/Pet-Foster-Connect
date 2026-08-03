import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";

// Référentiel public des espèces
export async function listSpecies(req: Request, res: Response) {
    const species = await prisma.species.findMany({ orderBy: { name: "asc" } });
    res.json(species);
}