import assert from "node:assert";
import { describe, it } from "node:test";
import { anonymousRequester } from "../../tests/index.ts";

// Ce fichier envoie volontairement des données "n'importe quoi" à l'API pour
// vérifier qu'elle répond toujours proprement (jamais un crash / 500), même
// sur des entrées auxquelles on ne pense pas forcément en écrivant les tests
// "normaux". C'est ce qu'on appelle du fuzzing.
//
// Deux vrais bugs ont été trouvés en écrivant ce fichier (tous les deux
// corrigés dans global-error-handler.middleware.ts) :
// - un octet nul dans un champ texte faisait planter Postgres, non rattrapé
//   -> 500 au lieu de 400
// - un JSON mal formé dans le body faisait planter le parseur d'Express,
//   non rattrapé -> 500 au lieu de 400

function fosterPayload(overrides: Record<string, unknown> = {}) {
    return {
        role: "foster",
        firstName: "Camille",
        lastName: "Martin",
        email: `fuzz-${Math.random()}@example.com`,
        password: "Motdepasse123",
        confirm: "Motdepasse123",
        city: "Lyon",
        ...overrides,
    };
}

describe("Fuzzing — POST /api/auth/register", () => {
    // Valeurs "n'importe quoi" pour un champ censé être une chaîne de
    // caractères. On ne sait pas toujours à l'avance si l'API va répondre
    // 400 (rejeté) ou 201 (accepté tel quel, ex: texte avec des caractères
    // spéciaux) : la seule chose garantie, c'est qu'elle ne doit jamais planter.
    const randomValues: unknown[] = [
        null,
        42,
        true,
        [],
        {},
        ["tableau", "au", "lieu", "de", "chaine"],
        "a".repeat(100_000),
        "🐶🐾".repeat(500),
        "<script>alert(1)</script>",
        "'; DROP TABLE users; --",
    ];

    for (const value of randomValues) {
        it(`should not crash (500) when firstName = ${JSON.stringify(value)?.slice(0, 40)}`, async () => {
            const response = await anonymousRequester.post("/auth/register", fosterPayload({ firstName: value }));

            assert.notStrictEqual(response.status, 500);
        });
    }

    it("should return 400, not 500, for malformed (unparseable) JSON", async () => {
        const response = await anonymousRequester.post(
            "/auth/register",
            '{"firstName": "test", invalid json',
            { headers: { "Content-Type": "application/json" } },
        );

        assert.strictEqual(response.status, 400);
    });

    it("should return 400, not 500, when firstName contains a null byte", async () => {
        const nullByte = String.fromCharCode(0);

        const response = await anonymousRequester.post(
            "/auth/register",
            fosterPayload({ firstName: "a" + nullByte + "b" }),
        );

        assert.strictEqual(response.status, 400);
    });

    it("should return 400 when the body is an array instead of an object", async () => {
        const response = await anonymousRequester.post("/auth/register", [1, 2, 3]);

        assert.strictEqual(response.status, 400);
    });
});
