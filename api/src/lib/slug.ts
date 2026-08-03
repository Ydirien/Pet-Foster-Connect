// Le schéma Prisma n'a pas de colonne slug : les slugs sont calculés à la volée
// à partir du nom + id (ex: "rex-le-chien-3"), et l'id est ré-extrait du suffixe
// pour retrouver la ressource. Un id numérique brut reste accepté.

export function slugify(name: string): string {
    return name
        .normalize("NFD") // décompose les caractères accentués (é -> e + ́)
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function buildSlug(id: number, name: string): string {
    const base = slugify(name);
    return base ? `${base}-${id}` : String(id);
}

export function parseIdFromSlug(slug: string): number | null {
    const match = /(?:^|-)(\d+)$/.exec(slug);
    if (!match) return null;
    return parseInt(match[1]!, 10);
}