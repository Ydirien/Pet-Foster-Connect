import assert from "node:assert";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { anonymousRequester, buildAuthedRequester } from "../../tests/index.ts";

let counter = 0;

async function createFosterUser() {
    counter++;
    return prisma.user.create({
        data: {
            email: `foster-${counter}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            foster: {
                create: { firstName: "Camille", lastName: "Martin", city: "Lyon" },
            },
        },
    });
}

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

async function createSpecies(name?: string) {
    counter++;
    return prisma.species.create({ data: { name: name ?? `Espece ${counter}` } });
}

async function createAnimal(
    associationId: number,
    speciesId: number,
    overrides: Record<string, unknown> = {},
) {
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
// GET /api/animaux
// ---------------------------------------------------------------------------

describe("[GET] /api/animaux", () => {
    it("should list animals without filters", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        await createAnimal(association.id, species.id);
        await createAnimal(association.id, species.id);

        const { data, status } = await anonymousRequester.get("/animaux");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 2);
    });

    it("should filter by speciesId", async () => {
        const association = await createAssociationUser();
        const dog = await createSpecies("Chien");
        const cat = await createSpecies("Chat");
        await createAnimal(association.id, dog.id);
        await createAnimal(association.id, cat.id);

        const { data, status } = await anonymousRequester.get(`/animaux?speciesId=${dog.id}`);

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].speciesId, dog.id);
    });

    it("should filter by status", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        await createAnimal(association.id, species.id, { status: "available" });
        await createAnimal(association.id, species.id, { status: "in_foster_care" });

        const { data, status } = await anonymousRequester.get("/animaux?status=available");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].status, "available");
    });

    it("should filter by age category", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        await createAnimal(association.id, species.id, { age: 0 }); // puppy
        await createAnimal(association.id, species.id, { age: 5 }); // adult

        const { data, status } = await anonymousRequester.get("/animaux?ageCategory=puppy");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 1);
    });
});

// ---------------------------------------------------------------------------
// GET /api/animaux/:slug
// ---------------------------------------------------------------------------

describe("[GET] /api/animaux/:slug", () => {
    it("should return the animal detail with its association's slug", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id, { name: "Rex" });

        const { data, status } = await anonymousRequester.get(`/animaux/rex-${animal.id}`);

        assert.strictEqual(status, 200);
        assert.strictEqual(data.name, "Rex");
        assert.ok(data.association.slug);
    });

    it("should return 404 for an unknown animal", async () => {
        const { status } = await anonymousRequester.get("/animaux/inconnu-99999");
        assert.strictEqual(status, 404);
    });
});

// ---------------------------------------------------------------------------
// POST /api/animaux
// ---------------------------------------------------------------------------

describe("[POST] /api/animaux", () => {
    it("should create an animal as the authenticated association", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: species.id,
        });

        assert.strictEqual(status, 201);
        assert.strictEqual(data.name, "Rex");
        assert.strictEqual(data.associationId, association.id);
        assert.strictEqual(data.status, "available");
    });

    it("should create an animal with incompatible species", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const incompatible = await createSpecies();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: species.id,
            incompatibleSpeciesIds: [incompatible.id],
        });

        assert.strictEqual(status, 201);
        assert.strictEqual(data.incompatibleSpecies.length, 1);
    });

    it("should return 400 for an unknown species", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: 99999,
        });

        assert.strictEqual(status, 400);
    });

    it("should return 400 if required fields are missing", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.post("/animaux", { name: "Rex" });

        assert.strictEqual(status, 400);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: 1,
        });
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.post("/animaux", {
            name: "Rex",
            gender: "male",
            speciesId: 1,
        });

        assert.strictEqual(status, 403);
    });
});

// ---------------------------------------------------------------------------
// PUT /api/animaux/:id
// ---------------------------------------------------------------------------

describe("[PUT] /api/animaux/:id", () => {
    it("should update an animal owned by the authenticated association", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.put(`/animaux/${animal.id}`, {
            behavior: "Très joueur",
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.behavior, "Très joueur");
    });

    it("should replace the incompatible species list", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const oldIncompatible = await createSpecies();
        const newIncompatible = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        await prisma.animalIncompatibleSpecies.create({
            data: { animalId: animal.id, speciesId: oldIncompatible.id },
        });
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.put(`/animaux/${animal.id}`, {
            incompatibleSpeciesIds: [newIncompatible.id],
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.incompatibleSpecies.length, 1);
        assert.strictEqual(data.incompatibleSpecies[0].speciesId, newIncompatible.id);
    });

    it("should allow marking foster care as completed", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id, {
            status: "in_foster_care",
        });
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.put(`/animaux/${animal.id}`, {
            status: "completed",
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.status, "completed");
    });

    it("should reject an invalid status transition", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id, {
            status: "available",
        });
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.put(`/animaux/${animal.id}`, {
            status: "completed",
        });

        assert.strictEqual(status, 400);
    });

    it("should return 403 if the association does not own the animal", async () => {
        const association = await createAssociationUser();
        const otherAssociation = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({
            id: otherAssociation.id,
            role: "association",
        });

        const { status } = await requester.put(`/animaux/${animal.id}`, {
            behavior: "Piraté",
        });

        assert.strictEqual(status, 403);
    });

    it("should return 404 for an unknown animal", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.put("/animaux/99999", { behavior: "Test" });

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.put("/animaux/1", { behavior: "Test" });
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.put("/animaux/1", { behavior: "Test" });

        assert.strictEqual(status, 403);
    });
});

// ---------------------------------------------------------------------------
// DELETE /api/animaux/:id
// ---------------------------------------------------------------------------

describe("[DELETE] /api/animaux/:id", () => {
    it("should delete an animal owned by the authenticated association", async () => {
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.delete(`/animaux/${animal.id}`);

        assert.strictEqual(status, 204);

        const remaining = await prisma.animal.findUnique({ where: { id: animal.id } });
        assert.strictEqual(remaining, null);
    });

    it("should return 403 if the association does not own the animal", async () => {
        const association = await createAssociationUser();
        const otherAssociation = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({
            id: otherAssociation.id,
            role: "association",
        });

        const { status } = await requester.delete(`/animaux/${animal.id}`);

        assert.strictEqual(status, 403);
    });

    it("should return 404 for an unknown animal", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.delete("/animaux/99999");

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.delete("/animaux/1");
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.delete("/animaux/1");

        assert.strictEqual(status, 403);
    });
});