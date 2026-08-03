import assert from "node:assert";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { anonymousRequester, buildAuthedRequester } from "../../tests/index.ts";

async function createFosterUser() {
    return prisma.user.create({
        data: {
            email: `foster-${Date.now()}-${Math.random()}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            foster: {
                create: {
                    firstName: "Camille",
                    lastName: "Martin",
                    city: "Lyon",
                },
            },
        },
    });
}

async function createAssociationUser() {
    return prisma.user.create({
        data: {
            email: `asso-${Date.now()}-${Math.random()}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            association: {
                create: {
                    name: "Refuge Test",
                    city: "Lyon",
                },
            },
        },
    });
}

describe("authenticate", () => {
    it("should return 401 on a protected route without a token", async () => {
        const { status } = await anonymousRequester.get("/users/me");
        assert.strictEqual(status, 401);
    });

    it("should return 401 with an invalid token", async () => {
        const { status } = await anonymousRequester.get("/users/me", {
            headers: { Authorization: "Bearer invalid.token.here" },
        });
        assert.strictEqual(status, 401);
    });

    it("should allow access to a protected route with a valid token", async () => {
        const user = await createFosterUser();
        const requester = buildAuthedRequester({ id: user.id, role: "foster" });

        const { status } = await requester.get("/users/me");
        assert.strictEqual(status, 200);
    });
});

describe("checkRole", () => {
    it("should return 403 when the role is not authorized", async () => {
        const fosterRequester = buildAuthedRequester({ id: 1, role: "foster" });

        const { status } = await fosterRequester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: 1,
        });
        assert.strictEqual(status, 403);
    });

    it("should let the request through when the role is authorized", async () => {
        const association = await createAssociationUser();
        const species = await prisma.species.create({ data: { name: "Chien" } });
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: species.id,
        });
        assert.strictEqual(status, 201);
    });
});