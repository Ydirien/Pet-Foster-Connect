import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../lib/tokens.ts";
import type { Role } from "../lib/roles.ts";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.ts";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Middleware qui vérifie que l'utilisateur est bien connecté (token JWT valide)
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = extractAccessToken(req);

    try {
        req.user = verifyAccessToken(token, JWT_SECRET);
    } catch (err) {
        console.error("Echec de vérification du token:", err);
        throw new UnauthorizedError("Token d'accès invalide ou expiré");
    }

    next();
}

// À placer APRÈS authenticate : vérifie que le rôle du JWT fait partie des rôles autorisés
export function checkRole(...roles: Role[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError("Authentification requise");
        }

        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError(`Permission refusée pour le rôle ${req.user.role}`);
        }

        next();
    };
}

function extractAccessToken(req: Request): string {
    // Le token arrive via le header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedError("Token d'accès manquant");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new UnauthorizedError("Token d'accès manquant");
    }

    return token;
}