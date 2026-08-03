import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
// Plafond généreux mais raisonnable pour une photo affichée en carte/fiche.
const MAX_DIMENSION = 1600;
// Nom de fichier généré par saveOptimizedImage : uuid + extension figée.
const UPLOAD_FILENAME_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

// Réencode systématiquement en webp (format moderne, léger) et plafonne les
// dimensions : garde le site rapide (§ demande explicite) et neutralise au
// passage tout payload caché dans le fichier d'origine (métadonnées EXIF,
// fichier polyglotte...) puisque rien de l'entrée n'est jamais écrit tel quel.
async function saveOptimizedImage(buffer: Buffer, subfolder: string): Promise<string> {
    const dir = path.join(UPLOADS_ROOT, subfolder);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const filePath = path.join(dir, filename);

    await sharp(buffer)
        .rotate() // applique l'orientation EXIF puis la retire au réencodage
        .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
        })
        .webp({ quality: 75 })
        .toFile(filePath);

    return `/uploads/${subfolder}/${filename}`;
}

export function saveOptimizedAnimalImage(buffer: Buffer): Promise<string> {
    return saveOptimizedImage(buffer, "animals");
}

export function saveOptimizedProfileImage(buffer: Buffer): Promise<string> {
    return saveOptimizedImage(buffer, "profiles");
}

// Vérifie qu'une URL fournie par le client (Animal.imageUrl, Association.imageUrl,
// Foster.imageUrl) pointe réellement vers un fichier déjà retraité par
// saveOptimizedImage - donc passé par sharp (réencodage WebP, redimensionnement,
// suppression des métadonnées EXIF) - plutôt que d'accepter n'importe quelle URL
// externe non retraitée (aucune garantie de nettoyage sur un fichier hébergé
// ailleurs). Le host/protocole de l'URL n'est volontairement pas comparé : il
// varie selon l'environnement (dev/Docker/prod) alors que le chemin, lui, est
// stable ; seule l'existence réelle du fichier sur le disque local fait foi.
export function isOwnProcessedImageUrl(
    url: string,
    subfolder: "animals" | "profiles",
): boolean {
    let pathname: string;
    try {
        pathname = new URL(url).pathname;
    } catch {
        return false;
    }

    const prefix = `/uploads/${subfolder}/`;
    if (!pathname.startsWith(prefix)) return false;

    const filename = pathname.slice(prefix.length);
    if (!UPLOAD_FILENAME_PATTERN.test(filename)) return false;

    return existsSync(path.join(UPLOADS_ROOT, subfolder, filename));
}