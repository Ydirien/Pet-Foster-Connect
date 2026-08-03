import { rateLimit, MemoryStore } from "express-rate-limit";

// Bypass des limites uniquement en développement local : en production ET en
// test, les vraies limites s'appliquent (sinon rate-limit.middleware.spec.test.ts
// ne pourrait jamais vérifier un vrai blocage).
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const shouldBypassLimit = !isProduction && !isTest;

const WINDOW_MS = 15 * 60 * 1000;
const MESSAGE = { status: 429, error: "Trop de tentatives, réessayez plus tard" };

const REGISTER_LIMIT = 10;
// Exporté : utilisé par le test pour vérifier le header RateLimit-Limit et
// épuiser le quota sans dupliquer le nombre en dur dans le test.
export const RATE_LIMIT = 5;
const FORGOT_PASSWORD_LIMIT = 5;
const RESET_PASSWORD_LIMIT = 5;

// Une référence par store, pour pouvoir les réinitialiser entre deux tests.
const stores: MemoryStore[] = [];

function makeLimiter(limit: number) {
    const store = new MemoryStore();
    stores.push(store);

    return rateLimit({
        windowMs: WINDOW_MS,
        limit: shouldBypassLimit ? 1000 : limit,
        message: MESSAGE,
        store,
        standardHeaders: "draft-6",
        legacyHeaders: false,
    });
}

// Anti brute-force sur les routes sensibles d'authentification
export const rateLimiters = {
    register: makeLimiter(REGISTER_LIMIT),
    login: makeLimiter(RATE_LIMIT),
    forgotPassword: makeLimiter(FORGOT_PASSWORD_LIMIT),
    resetPassword: makeLimiter(RESET_PASSWORD_LIMIT),
};

// Réinitialise le quota de tous les limiteurs — appelé dans beforeEach() des
// tests pour que chaque test démarre avec un compteur à zéro.
export function resetRateLimiters() {
    for (const store of stores) {
        store.resetAll();
    }
}