function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

// La lib "cors" traite une string comme une unique origine fixe : pour
// autoriser plusieurs domaines (prod + staging, www + non-www...) il faut lui
// passer un tableau. Une liste séparée par des virgules couvre ce cas sans
// changer le format pour l'usage courant (une seule origine).
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;

// "*" n'est acceptable qu'en dev local : en production, ALLOWED_ORIGINS doit
// être défini explicitement, sinon n'importe quel site pourrait appeler l'API.
if (!allowedOriginsEnv && process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: ALLOWED_ORIGINS");
}

const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(",").map((origin) => origin.trim())
    : "*";

export const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    // URL directe Postgres pour le driver pg ; DATABASE_URL (prisma+postgres://) reste utilisée par le CLI Prisma
    databaseUrl: process.env.DIRECT_DATABASE_URL || requireEnv("DATABASE_URL"),
    // Pas de valeur par défaut sûre en prod : "*" n'est acceptable qu'en dev
    // local. À définir explicitement (ALLOWED_ORIGINS) dès qu'un domaine réel sert le front.
    allowedOrigins,
    accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
    logLevel: process.env.LOG_LEVEL || "http",
};