import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client.ts";
import { config } from "../../config.ts";

// On réexporte tous les modèles pour faciliter leur utilisatation dans le reste de l'application
export * from "../../prisma/generated/client.ts";

const connectionString = config.databaseUrl;
const adapter = new PrismaPg({ connectionString });

// On exporte une connexion à la base de données
export const prisma = new PrismaClient({ adapter });