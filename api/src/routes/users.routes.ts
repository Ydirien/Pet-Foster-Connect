import { Router } from "express";
import * as usersController from "../controllers/users.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";
import { uploadProfileImage } from "../middlewares/upload.middleware.ts";

export const router = Router();

router.use(authenticate);

// Profil complet de l'utilisateur connecté, quel que soit son rôle
router.get("/me", usersController.getCurrentUser);

// Upload de la photo de profil : appelé séparément avant PUT /me
// (même pattern que POST /animaux/upload), le body de /me reste du JSON
// classique avec l'URL d'image renvoyée ici.
router.post(
    "/me/photo",
    checkRole("foster"),
    uploadProfileImage,
    usersController.uploadProfilePhoto,
);

// Mise à jour du profil (capacité d'accueil incluse, tout optionnel)
router.put(
    "/me",
    checkRole("foster"),
    usersController.updateFosterProfile,
);

// Animaux déjà présents au foyer
router.post(
    "/me/animaux-foyer",
    checkRole("foster"),
    usersController.addHouseholdPet,
);

router.delete(
    "/me/animaux-foyer/:petId",
    checkRole("foster"),
    usersController.removeHouseholdPet,
);

// Vue du profil d'une famille d'accueil, réservée à une association liée par
// une demande d'accueil (vérifié dans le contrôleur)
router.get(
    "/:id",
    checkRole("association"),
    usersController.getFosterProfileForAssociation,
);

// Suppression du compte connecté (cascade gérée par le schéma pour la famille
// d'accueil ; les animaux de l'association sont supprimés avant le compte).
router.delete("/me", usersController.deleteCurrentUser);