import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../lib/errors.ts";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Stockage en mémoire : le fichier brut envoyé par le client n'est jamais
// écrit tel quel sur le disque. Il ne survit que le temps de la requête et
// passe systématiquement par sharp (image-processing.ts) qui écrit seulement
// le résultat réencodé/redimensionné.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
    fileFilter(_req, file, cb) {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new BadRequestError("Only JPEG, PNG, WEBP or GIF images are allowed"));
        return;
        }
        cb(null, true);
    },
});

const uploadSingleImage = upload.single("image");

// Traduit les erreurs multer (taille dépassée, champ manquant...) en
// BadRequestError cohérentes avec le reste de l'API plutôt que de laisser
// remonter un MulterError brut jusqu'au global-error-handler (500).
function handleSingleImageUpload(req: Request, res: Response, next: NextFunction) {
    uploadSingleImage(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            next(new BadRequestError("Image must be smaller than 5MB"));
            return;
        }
        next(new BadRequestError(err.message));
        return;
        }
        if (err) {
        next(err);
        return;
        }
        if (!req.file) {
        next(new BadRequestError("No image file provided (field name: image)"));
        return;
        }
        next();
    });
}

export const uploadAnimalImage = handleSingleImageUpload;
export const uploadProfileImage = handleSingleImageUpload;