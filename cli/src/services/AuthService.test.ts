import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register } from "./AuthService";

function mockFetchResponse(ok: boolean, status: number, body: unknown) {
    return {
        ok,
        status,
        json: () => Promise.resolve(body),
    } as Response;
}

describe("AuthService", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    it("login() renvoie le token et l'utilisateur quand la requête réussit", async () => {
        const loginResponse = {
            accessToken: { token: "abc", type: "Bearer", expiresInMS: 900000 },
            user: { id: 1, email: "camille@email.com", role: "foster" },
        };
        vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, loginResponse));

        const result = await login({ email: "camille@email.com", password: "motdepasse123!" });

        expect(result).toEqual(loginResponse);
    });

    it("login() lève une erreur explicite quand les identifiants sont refusés (401)", async () => {
        vi.mocked(fetch).mockResolvedValue(mockFetchResponse(false, 401, null));

        await expect(login({ email: "camille@email.com", password: "faux" })).rejects.toThrow(
            "Email ou mot de passe incorrect",
        );
    });

    it("register() signale un SIRET déjà utilisé quand l'API renvoie un conflit 409", async () => {
        vi.mocked(fetch).mockResolvedValue(
            mockFetchResponse(false, 409, { error: "Ce SIRET est déjà utilisé" }),
        );

        await expect(
            register({
                role: "association",
                email: "asso@email.com",
                password: "motdepasse123!",
                confirm: "motdepasse123!",
                city: "Lyon",
                name: "Les Amis des Bêtes",
                siret: "12345678901234",
            }),
        ).rejects.toThrow("Ce numéro SIRET est déjà utilisé.");
    });
});
