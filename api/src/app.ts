import "./lib/zod-locale.ts";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { router as apiRouter } from "./routes/index.routes.ts";
import { config } from "../config.ts";
import { globalErrorHandler } from "./middlewares/global-error-handler.middleware.ts";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.ts";
import { helmetMiddleware } from "./middlewares/helmet.middleware.ts";
import { xssSanitizerMiddleware } from "./middlewares/xss-sanitizer.middleware.ts";
import { logRequest } from "./middlewares/log.request.middleware.ts";

// Créer une app Express
export const app = express();

// Sécuriser les headers HTTP
app.use(helmetMiddleware);

// Autoriser les requêtes cross-origin
app.use(cors({ origin: config.allowedOrigins }));

// Body parser pour récupérer les body "application/json" dans req.body
app.use(express.json());

// Parser les cookies (accessToken/refreshToken) pour les rendre disponibles dans req.cookies
app.use(cookieParser());

// Nettoyer les chaînes du body pour prévenir les injections XSS
app.use(xssSanitizerMiddleware);

// logger des requêtes HTTP
app.use(logRequest);

// Photos d'animaux/profils uploadées : servies statiquement, publiques comme
// le reste des annonces. Le dossier est créé à la volée par
// image-processing.ts s'il n'existe pas encore.
// Cross-Origin-Resource-Policy "cross-origin" nécessaire ici : le front tourne
// sur une autre origine (port Vite) et helmet() pose "same-origin" par défaut,
// ce qui bloque le chargement des <img> depuis le front.
app.use(
    "/uploads",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static(path.join(process.cwd(), "uploads")),
);

// Brancher le routeur de l'API
app.use("/api", apiRouter);

// Intercepter favicon
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

// Not found middleware
app.use(notFoundMiddleware);

// Global error middleware
app.use(globalErrorHandler);