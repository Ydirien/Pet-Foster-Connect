import type { Logger } from "../lib/logger.ts";
import type { Role } from "../lib/roles.ts";

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number;
                role: Role;
            };
            requestId?: string;
            log: Logger;
        }
    }
}

export {};