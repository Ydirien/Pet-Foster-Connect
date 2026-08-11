import type { NextFunction, Request, Response } from "express";
import { HttpClientError } from "../lib/errors.ts";
import z from "zod";
import { logger } from "../lib/logger.ts";
import { Prisma } from "../models/index.ts";

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

    // 3) Gérer le JSON malformé envoyé par le client (body-parser) -> 400
    // ex : un body tronqué ou avec une virgule en trop
    if (error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
        logger.info("JSON malformé", error);

        return res.status(400).json({
        status: 400,
        error: "JSON invalide",
        });
    }

    // 4) Gérer les erreurs Prisma connues non rattrapées ailleurs (ex : une
    // valeur rejetée par la base de données) -> 400, ce n'est pas le serveur
    // qui a un problème, c'est une donnée envoyée par le client
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.info("PrismaClientKnownRequestError", error);

        return res.status(400).json({
        status: 400,
        error: "Données invalides",
        });
    }

    // Si l'erreur arrive à ce stade, il faut la logger avec un niveau approprié
    logger.error("Internal server error", error);

    // 5) Gérer les erreurs serveurs - 500
    // Toutes les erreurs non controllées
    // - ex : la BDD plante
    // - ex : on a fait une erreur de syntaxe
    res.status(500).json({
        status: 500,
        error: "Internal server error",
    });
}