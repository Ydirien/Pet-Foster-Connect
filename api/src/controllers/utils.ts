import z from "zod";

export async function parseIdFromParams(id: string | string[]): Promise<number> {
    return z.coerce.number().int().positive().parseAsync(id);
}

export function parseSlugParam(slug: string | string[]): string {
    return z.string().min(1).parse(slug);
}