import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// Toute donnée entrante passe par un schéma Zod avant d'atteindre la couche service.
// En cas d'échec, la ZodError remonte au globalErrorHandler qui répond 400.
export function validateBody(schema: ZodType) {
    return async (req: Request, res: Response, next: NextFunction) => {
        req.body = await schema.parseAsync(req.body);
        next();
    };
}