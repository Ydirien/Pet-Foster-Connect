import { describe, it, expect, beforeEach } from "vitest";
import { authHeaders, clearAccessToken } from "./httpClient";

describe("httpClient", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("retourne un header Authorization quand un token est stocké", () => {
        localStorage.setItem("accessToken", "mon-token");

        expect(authHeaders()).toEqual({ Authorization: "Bearer mon-token" });
    });

    it("retourne un objet vide quand aucun token n'est stocké", () => {
        expect(authHeaders()).toEqual({});
    });

    it("supprime le token et l'utilisateur du localStorage", () => {
        localStorage.setItem("accessToken", "mon-token");
        localStorage.setItem("authUser", JSON.stringify({ id: 1 }));

        clearAccessToken();

        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("authUser")).toBeNull();
    });
});
