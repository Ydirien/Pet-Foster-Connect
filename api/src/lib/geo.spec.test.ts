import assert from "node:assert";
import { describe, it } from "node:test";
import { haversineDistanceKm } from "./geo.ts";

// Test unitaire : aucune base de données ni serveur HTTP ici, on vérifie
// juste le calcul en isolation (utilisé par le filtre "ville + rayon").

const PARIS = { latitude: 48.8566, longitude: 2.3522 };
const LYON = { latitude: 45.764, longitude: 4.8357 };

describe("haversineDistanceKm", () => {
    it("should return 0 for two identical points", () => {
        const distance = haversineDistanceKm(PARIS, PARIS);
        assert.strictEqual(distance, 0);
    });

    it("should return the known distance between Paris and Lyon (~392 km)", () => {
        const distance = haversineDistanceKm(PARIS, LYON);
        assert.ok(distance > 390 && distance < 395, `expected ~392, got ${distance}`);
    });

    it("should be symmetric (A -> B === B -> A)", () => {
        const distanceAB = haversineDistanceKm(PARIS, LYON);
        const distanceBA = haversineDistanceKm(LYON, PARIS);
        assert.strictEqual(distanceAB, distanceBA);
    });
});
