import cors from "cors";
import express from "express";
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

// Brancher le routeur de l'API
app.use("/api", apiRouter);

// Not found middleware
app.use(notFoundMiddleware);

// Global error middleware
app.use(globalErrorHandler);