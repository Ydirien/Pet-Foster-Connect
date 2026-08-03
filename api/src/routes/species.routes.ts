import { Router } from "express";
import * as speciesController from "../controllers/species.controller.ts";

export const router = Router();

// Référentiel public des espèces
router.get("/", speciesController.listSpecies);