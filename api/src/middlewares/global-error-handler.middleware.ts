import type { NextFunction, Request, Response } from "express";
import { HttpClientError } from "../lib/errors.ts";
import z from "zod";
import { logger } from "../lib/logger.ts";

export function globalErrorHandler(
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
    ) {
    // 4 arguments, c'est spécifique à Express et c'est obligatoire
    // Plusieurs façon d'appeler ce middleware :
    // - dans un controlleur en amont, `next(error)`
    // - depuis Express 5, il suffit de throw une erreur dans un controlleur async pour que l'erreur soit transmise ici

    // 1) Gérer les erreurs de validation Zod -> 400 (note : techniquement il faudrait 422, mais on trouve très souvent 400)
    if (error instanceof z.ZodError) {
        console.info("ZodError", error);

        return res.status(400).json({
        status: 400,
        error: z.prettifyError(error),
        });
    }

    // 2) Gérer les erreurs client controllées
    // Toutes les HttpClientError
    // - ex : throw new NotFoundError()
    // - ex : throw new ConflictError()
    if (error instanceof HttpClientError) {
        logger.info("HttpClientError", error); // Niveau info pour la traçabilité

        return res.status(error.status).json({
        status: error.status,
        error: error.message,
        });
    }

    // Si l'erreur arrive à ce stade, il faut la logger avec un niveau approprié
    logger.error("Internal server error", error);

    // 4) Gérer les erreurs serveurs - 500
    // Toutes les erreurs non controllées
    // - ex : la BDD plante
    // - ex : on a fait une erreur de syntaxe
    res.status(500).json({
        status: 500,
        error: "Internal server error",
    });
}