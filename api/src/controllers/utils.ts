import z from "zod";

export async function parseIdFromParams(id: string): Promise<number> {
    return z.coerce.number().int().positive().parseAsync(id);
}