import type { Role } from "../lib/roles.ts";
import { logger } from "../lib/logger.ts";

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number;
                role: Role;
            };
            requestId?: string;
            log: typeof logger;
        }
    }
}

export {};