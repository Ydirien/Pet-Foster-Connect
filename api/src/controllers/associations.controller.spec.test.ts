// src/controllers/associations.controller.spec.test.ts
import assert from "node:assert";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { anonymousRequester, buildAuthedRequester } from "../../tests/index.ts";
import { buildSlug } from "../lib/slug.ts";

let counter = 0;

async function createAssociationUser() {
    counter++;
    return prisma.user.create({
        data: {
            email: `asso-${counter}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            association: { create: { name: `Refuge ${counter}`, city: "Lyon" } },
        },
    });
}

async function createFosterUser() {
    counter++;
    return prisma.user.create({
        data: {
            email: `foster-${counter}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            foster: { create: { firstName: "Camille", lastName: "Martin", city: "Lyon" } },
        },
    });
}

async function createSpecies() {
    counter++;
    return prisma.species.create({ data: { name: `Espece ${counter}` } });
}

async function createAnimal(associationId: number, speciesId: number, overrides: Record<string, unknown> = {}) {
    counter++;
    return prisma.animal.create({
        data: {
            name: `Animal ${counter}`,
            gender: "male",
            associationId,
            speciesId,
            status: "available",
            ...overrides,
        },
    });
}

// ---------------------------------------------------------------------------
// GET /api/associations/:slug
// ---------------------------------------------------------------------------

describe("[GET] /api/associations/:slug", () => {
    it("should include a usable association object on each listed animal", async () => {
        const associationUser = await createAssociationUser();
        const associationProfile = await prisma.association.findUniqueOrThrow({
            where: { userId: associationUser.id },
        });
        const species = await createSpecies();
        await createAnimal(associationUser.id, species.id, { name: "Rex" });

        const slug = buildSlug(associationUser.id, associationProfile.name);
        const { data, status } = await anonymousRequester.get(`/associations/${slug}`);

        assert.strictEqual(status, 200);
        assert.strictEqual(data.animals.length, 1);
        assert.strictEqual(data.animals[0].association.name, associationProfile.name);
        assert.ok(data.animals[0].association.slug);
    });
});

// ---------------------------------------------------------------------------
// PUT /api/associations/:id
// Ownership : une association ne peut modifier que son propre profil.
// ---------------------------------------------------------------------------

describe("[PUT] /api/associations/:id", () => {
    it("should let an association update its own profile", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.put(`/associations/${association.id}`, {
            description: "Nouvelle description",
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.description, "Nouvelle description");
    });

    it("should return 403 if the association tries to update another's profile", async () => {
        const association = await createAssociationUser();
        const otherAssociation = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.put(`/associations/${otherAssociation.id}`, {
            description: "Piraté",
        });

        assert.strictEqual(status, 403);

        const unchanged = await prisma.association.findUnique({
            where: { userId: otherAssociation.id },
        });
        assert.notStrictEqual(unchanged?.description, "Piraté");
    });

    it("should return 404 for an unknown association", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.put("/associations/99999", {
            description: "Test",
        });

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.put("/associations/1", {
            description: "Test",
        });
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.put("/associations/1", {
            description: "Test",
        });

        assert.strictEqual(status, 403);
    });
});