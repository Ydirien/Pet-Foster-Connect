import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { after, before, beforeEach, type TestContext } from "node:test";
import { app } from "../../src/app.ts";
import { prisma } from "../../src/models/index.ts";
import { resetRateLimiters } from "../../src/middlewares/rate-limit.middleware.ts";

let server: Server | undefined;

before(() => {
    // Supprime le conteneur de test s'il existe déjà (nettoyage préventif).
    // Sur Windows, execSync passe par cmd.exe qui ne comprend pas la syntaxe
    // bash "2>/dev/null || true" : on utilise un try/catch à la place, qui
    // fonctionne pareil sur Windows, Mac et Linux.
    try {
        execSync(`docker rm -f petfosterconnecttest`, { stdio: "ignore" });
    } catch {
        // Le conteneur n'existait pas encore, rien à faire.
    }

    // Créer un conteneur BDD dédié aux tests (commande sur une seule ligne :
    // les retours à la ligne avec "\" sont une syntaxe bash, pas garantie sous Windows).
    execSync(
        `docker run -d --name petfosterconnecttest -p ${process.env.POSTGRES_PORT}:5432 -e POSTGRES_USER=${process.env.POSTGRES_USER} -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} -e POSTGRES_DB=${process.env.POSTGRES_DB} postgres:17`,
    );

    // Attendre que PostgreSQL soit prêt à accepter des connexions. La boucle
    // "until ... do ... done" du script d'origine est du bash : on la remplace
    // par une boucle JS qui retente pg_isready toutes les 500ms.
    waitForPostgresReady();

    // Lancer les migrations sur la BDD de test
    execSync(`npx prisma migrate deploy`);

    // On lance un serveur de test
    server = app.listen(process.env.PORT);
});

beforeEach(async (t) => {
    (t as TestContext).mock.method(console, "info", () => {});
    resetRateLimiters();
    await truncateTables();
});

after(async () => {
    server?.close();

    await prisma.$disconnect();

    execSync(`docker rm -f petfosterconnecttest`);
});

function waitForPostgresReady() {
    const maxAttempts = 60;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            execSync(`docker exec petfosterconnecttest pg_isready -U ${process.env.POSTGRES_USER}`, {
                stdio: "ignore",
            });
            return; // pg_isready a répondu avec succès, Postgres est prêt
        } catch {
            // Pas encore prêt, on retente après une courte pause.
        }
        sleepSync(500);
    }

    throw new Error("PostgreSQL n'a pas démarré à temps");
}

// Pause synchrone cross-platform (pas de sleep natif bloquant en Node).
function sleepSync(ms: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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