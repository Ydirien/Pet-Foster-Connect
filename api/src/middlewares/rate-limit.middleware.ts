import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";

const WINDOW_MS = 15 * 60 * 1000;
const MESSAGE = { status: 429, error: "Trop de tentatives, réessayez plus tard" };

function makeLimiter(limit: number) {
    return rateLimit({
        windowMs: WINDOW_MS,
        limit: isDev ? 1000 : limit,
        message: MESSAGE,
    });
}

// Anti brute-force sur les routes sensibles d'authentification (§5.7)
export const rateLimiters = {
    register: makeLimiter(10),
    login: makeLimiter(5),
    forgotPassword: makeLimiter(5),
    resetPassword: makeLimiter(5),
};