import { createLogger, format, transports } from "winston";
import process from "node:process";

const logLevel = process.env.LOG_LEVEL || "http";

export const logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
    ),
    transports: [
        new transports.File({
            filename: "errors.log",
            level: "error",
        }),
        new transports.File({
            filename: "combined.log",
        }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple(),
            ),
        }),
    );
}