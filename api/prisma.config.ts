import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
        // Base "shadow" fournie par `npx prisma dev` en développement local
        // uniquement : normalisée en undefined si absente/vide, car
        // `migrate deploy` (utilisé en tests et en CI) n'en a pas besoin.
        shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] || undefined,
    },
});