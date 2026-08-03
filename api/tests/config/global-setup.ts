import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { after, before, beforeEach, type TestContext } from "node:test";
import { app } from "../../src/app.ts";
import { prisma } from "../../src/models/index.ts";

// === AVANT le lancement des tests ===
// Création d'une BDD de test Docker, chargement de .env.test, migrations, lancement du serveur
// === Entre chaque test === on vide les tables
// === APRES les tests === déconnexion Prisma, arrêt serveur, suppression du conteneur

let server: Server;

before(() => {
    execSync(`docker rm -f petfosterconnecttest 2>/dev/null || true`);

    execSync(`
        docker run \
        -d \
        --name petfosterconnecttest \
        -p ${process.env.POSTGRES_PORT}:5432 \
        -e POSTGRES_USER=${process.env.POSTGRES_USER} \
        -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} \
        -e POSTGRES_DB=${process.env.POSTGRES_DB} \
        postgres:17
    `);

    execSync(`
        until docker exec petfosterconnecttest pg_isready -U ${process.env.POSTGRES_USER} > /dev/null 2>&1; do
            sleep 0.5
        done
    `);

    execSync(`npx prisma migrate deploy`);

    server = app.listen(process.env.PORT);
});

beforeEach(async (t) => {
    (t as TestContext).mock.method(console, "info", () => {});
    await truncateTables();
});

after(async () => {
    server.close();
    await prisma.$disconnect();
    execSync(`docker rm -f petfosterconnecttest`);
});

async function truncateTables() {
    await prisma.$executeRawUnsafe(`
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;
    `);
}