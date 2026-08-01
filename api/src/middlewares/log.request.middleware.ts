import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.ts";
import { randomUUID } from "node:crypto";

export function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log("-----> Requete reçue");
    const id = req.get("x-request-id") || randomUUID();
    res.setHeader("x-request-id", id);
    req.log = logger.child({ requestId: id });
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e6; // 1e6 = 1 000 000
        const logObject = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            duration,
        };
        req.log.http("http_request", logObject);
        console.log("-----> Réponse renvoyée", JSON.stringify(logObject, null, 2));
    });

    next();
}