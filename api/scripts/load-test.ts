import autocannon from "autocannon";
import { config } from "../config.ts";

// Route publique la plus consultée de l'application (liste des animaux),
// sans authentification requise : c'est la cible la plus représentative
// pour un test de charge simple.
const API_URL = process.env.API_PUBLIC_URL || `http://localhost:${config.port}`;

async function runLoadTest() {
    console.log(`Test de charge sur ${API_URL}/api/animaux ...`);

    const result = await autocannon({
        url: `${API_URL}/api/animaux`,
        connections: 10,
        duration: 10,
    });

    console.log("");
    console.log("Requêtes/seconde (moyenne) :", result.requests.average);
    console.log("Latence moyenne (ms) :", result.latency.average);
    console.log("Latence p99 (ms) :", result.latency.p99);
    console.log("Réponses 2xx :", result["2xx"]);
    console.log("Réponses non-2xx :", result.non2xx);
    console.log("Erreurs de connexion :", result.errors);

    if (result.errors > 0 || result.non2xx > 0) {
        console.error("\n❌ Le test de charge a rencontré des erreurs ou des réponses non-2xx.");
        process.exit(1);
    }

    console.log("\n✅ L'API a tenu la charge sans erreur.");
}

runLoadTest();
