import { Router } from "express";
import * as animalsController from "../controllers/animals.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";
import { uploadAnimalImage } from "../middlewares/upload.middleware.ts";

export const router = Router();

// Public : liste filtrable et détail
router.get("/", animalsController.listAnimals);
router.get("/:slug", animalsController.getAnimalDetail);

// Réservé aux associations : upload de la photo, appelé séparément avant
// create/update (le body de ces deux routes reste du JSON classique).
router.post(
    "/upload",authenticate,checkRole("association"),
    uploadAnimalImage,
    animalsController.uploadImage,
);

router.post(
    "/",
    authenticate,
    checkRole("association"),
    animalsController.createAnimal,
);

router.put(
    "/:id",
    authenticate,
    checkRole("association"),
    animalsController.updateAnimal,
);

router.delete(
    "/:id",
    authenticate,
    checkRole("association"),
    animalsController.deleteAnimal,
);