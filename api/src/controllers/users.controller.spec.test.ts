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
            foster: { create: { firstName: "Camille", lastName: "Martin", city: "Lyon" } },
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

async function createSpecies() {
    counter++;
    return prisma.species.create({ data: { name: `Espece ${counter}` } });
}

async function createAnimal(associationId: number, speciesId: number) {
    counter++;
    return prisma.animal.create({
        data: {
            name: `Animal ${counter}`,
            gender: "male",
            associationId,
            speciesId,
            status: "available",
        },
    });
}

// ---------------------------------------------------------------------------
// DELETE /api/users/me/animaux-foyer/:petId
// Ownership : un foster ne peut supprimer que ses propres animaux du foyer.
// ---------------------------------------------------------------------------

describe("[DELETE] /api/users/me/animaux-foyer/:petId", () => {
    it("should let a foster delete their own household pet", async () => {
        const foster = await createFosterUser();
        const species = await createSpecies();
        const pet = await prisma.householdPet.create({
            data: { fosterId: foster.id, speciesId: species.id },
        });
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.delete(`/users/me/animaux-foyer/${pet.id}`);

        assert.strictEqual(status, 204);

        const remaining = await prisma.householdPet.findUnique({ where: { id: pet.id } });
        assert.strictEqual(remaining, null);
    });

    it("should return 403 if the pet belongs to another foster", async () => {
        const foster = await createFosterUser();
        const otherFoster = await createFosterUser();
        const species = await createSpecies();
        const pet = await prisma.householdPet.create({
            data: { fosterId: otherFoster.id, speciesId: species.id },
        });
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.delete(`/users/me/animaux-foyer/${pet.id}`);

        assert.strictEqual(status, 403);

        const stillExists = await prisma.householdPet.findUnique({ where: { id: pet.id } });
        assert.ok(stillExists);
    });

    it("should return 404 for an unknown pet", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.delete("/users/me/animaux-foyer/99999");

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.delete("/users/me/animaux-foyer/1");
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as an association", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.delete("/users/me/animaux-foyer/1");

        assert.strictEqual(status, 403);
    });
});

// ---------------------------------------------------------------------------
// GET /api/users/:id
// Accès restreint : une association ne voit un profil foster que si une
// demande d'accueil les relie.
// ---------------------------------------------------------------------------

describe("[GET] /api/users/:id", () => {
    it("should return the foster profile when linked by a foster request", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { data, status } = await requester.get(`/users/${foster.id}`);

        assert.strictEqual(status, 200);
        assert.strictEqual(data.firstName, "Camille");
        assert.ok(data.user.email);
    });

    it("should return 403 (not 404) if no foster request links them, even though the foster exists", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.get(`/users/${foster.id}`);

        assert.strictEqual(status, 403);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.get("/users/1");
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.get("/users/1");

        assert.strictEqual(status, 403);
    });
});