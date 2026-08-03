import { Router } from "express";
import * as associationsController from "../controllers/associations.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";
import { uploadProfileImage } from "../middlewares/upload.middleware.ts";

export const router = Router();

// Public
router.get("/", associationsController.listAssociations);
router.get("/:slug", associationsController.getAssociationDetail);

// Réservé aux associations : upload de la photo, appelé séparément avant
// PUT /:id (même pattern que POST /users/me/photo).
router.post(
    "/upload",
    authenticate,
    checkRole("association"),
    uploadProfileImage,
    associationsController.uploadImage,
);

// Réservé à l'association propriétaire (ownership vérifié dans le contrôleur -> 403)
router.put(
    "/:id",
    authenticate,
    checkRole("association"),
    associationsController.updateAssociation,
);