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
    counter++;
    return prisma.user.create({
        data: {
            email: `asso-${counter}@example.com`,
            password: await argon2.hash("Motdepasse123"),
            association: {
                create: {
                    name: `Refuge ${counter}`,
                    city: "Lyon",
                },
            },
        },
    });
}

async function createSpecies() {
    counter++;
    return prisma.species.create({ data: { name: `Espece ${counter}` } });
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
// POST /api/demandes
// ---------------------------------------------------------------------------

describe("[POST] /api/demandes", () => {
    it("should create a pending request for an available animal", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { data, status } = await requester.post("/demandes", {
            animalId: animal.id,
            message: "Bonjour, je suis intéressé",
        });

        assert.strictEqual(status, 201);
        assert.strictEqual(data.status, "pending");
        assert.strictEqual(data.animalId, animal.id);
    });

    it("should return 404 if the animal does not exist", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.post("/demandes", { animalId: 99999 });

        assert.strictEqual(status, 404);
    });

    it("should return 409 if the animal is no longer available", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id, {
            status: "in_foster_care",
        });
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.post("/demandes", { animalId: animal.id });

        assert.strictEqual(status, 409);
    });

    it("should return 409 for a duplicate active request on the same animal", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        await requester.post("/demandes", { animalId: animal.id });
        const { status } = await requester.post("/demandes", { animalId: animal.id });

        assert.strictEqual(status, 409);
    });

    it("should allow a new request after the previous one was rejected", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "rejected" },
        });
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.post("/demandes", { animalId: animal.id });

        assert.strictEqual(status, 201);
    });

    it("should return 400 if animalId is missing", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.post("/demandes", {});

        assert.strictEqual(status, 400);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.post("/demandes", { animalId: 1 });
        assert.strictEqual(status, 401);
    });

    it("should return 403 if authenticated as an association", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.post("/demandes", { animalId: 1 });

        assert.strictEqual(status, 403);
    });
});

// ---------------------------------------------------------------------------
// GET /api/demandes
// ---------------------------------------------------------------------------

describe("[GET] /api/demandes", () => {
    it("should return only the foster's own requests", async () => {
        const foster = await createFosterUser();
        const otherFoster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);

        await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });
        await prisma.fosterRequest.create({
            data: { fosterId: otherFoster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });
        const { data, status } = await requester.get("/demandes");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].fosterId, foster.id);
    });

    it("should return only requests on the association's own animals", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const otherAssociation = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const otherAnimal = await createAnimal(otherAssociation.id, species.id);

        await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });
        await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: otherAnimal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: association.id, role: "association" });
        const { data, status } = await requester.get("/demandes");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].animalId, animal.id);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.get("/demandes");
        assert.strictEqual(status, 401);
    });
});

// ---------------------------------------------------------------------------
// GET /api/demandes/:id
// ---------------------------------------------------------------------------

describe("[GET] /api/demandes/:id", () => {
    it("should be accessible to the requesting foster and the owning association", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const fosterRequester = buildAuthedRequester({ id: foster.id, role: "foster" });
        const { status: fosterStatus } = await fosterRequester.get(`/demandes/${request.id}`);
        assert.strictEqual(fosterStatus, 200);

        const associationRequester = buildAuthedRequester({
            id: association.id,
            role: "association",
        });
        const { status: associationStatus } = await associationRequester.get(
            `/demandes/${request.id}`,
        );
        assert.strictEqual(associationStatus, 200);
    });

    it("should return 403 for an unconcerned user", async () => {
        const foster = await createFosterUser();
        const otherFoster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: otherFoster.id, role: "foster" });
        const { status } = await requester.get(`/demandes/${request.id}`);

        assert.strictEqual(status, 403);
    });

    it("should return 404 for an unknown request", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.get("/demandes/99999");

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.get("/demandes/1");
        assert.strictEqual(status, 401);
    });
});

// ---------------------------------------------------------------------------
// PATCH /api/demandes/:id/status
// ---------------------------------------------------------------------------

describe("[PATCH] /api/demandes/:id/status", () => {
    it("should accept a request, put the animal in foster care, and reject other active requests", async () => {
        const foster = await createFosterUser();
        const otherFoster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);

        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });
        const otherRequest = await prisma.fosterRequest.create({
            data: { fosterId: otherFoster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: association.id, role: "association" });
        const { data, status } = await requester.patch(`/demandes/${request.id}/status`, {
            status: "accepted",
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.status, "accepted");

        const updatedAnimal = await prisma.animal.findUnique({ where: { id: animal.id } });
        assert.strictEqual(updatedAnimal?.status, "in_foster_care");

        const updatedOtherRequest = await prisma.fosterRequest.findUnique({
            where: { id: otherRequest.id },
        });
        assert.strictEqual(updatedOtherRequest?.status, "rejected");
    });

    it("should reject a request without affecting the animal or other requests", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: association.id, role: "association" });
        const { data, status } = await requester.patch(`/demandes/${request.id}/status`, {
            status: "rejected",
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.status, "rejected");

        const updatedAnimal = await prisma.animal.findUnique({ where: { id: animal.id } });
        assert.strictEqual(updatedAnimal?.status, "available");
    });

    it("should return 403 if the association does not own the animal", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const otherAssociation = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({
            id: otherAssociation.id,
            role: "association",
        });
        const { status } = await requester.patch(`/demandes/${request.id}/status`, {
            status: "accepted",
        });

        assert.strictEqual(status, 403);
    });

    it("should return 403 if authenticated as a foster", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.patch("/demandes/1/status", { status: "accepted" });

        assert.strictEqual(status, 403);
    });

    it("should return 409 if the request has already been treated", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "rejected" },
        });

        const requester = buildAuthedRequester({ id: association.id, role: "association" });
        const { status } = await requester.patch(`/demandes/${request.id}/status`, {
            status: "accepted",
        });

        assert.strictEqual(status, 409);
    });

    it("should return 400 for an invalid status value", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.patch("/demandes/1/status", { status: "pending" });

        assert.strictEqual(status, 400);
    });

    it("should return 404 for an unknown request", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.patch("/demandes/99999/status", {
            status: "accepted",
        });

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.patch("/demandes/1/status", {
            status: "accepted",
        });
        assert.strictEqual(status, 401);
    });
});

// ---------------------------------------------------------------------------
// DELETE /api/demandes/:id
// ---------------------------------------------------------------------------

describe("[DELETE] /api/demandes/:id", () => {
    it("should let the foster cancel their own pending request (status set to cancelled, not deleted)", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });
        const { status } = await requester.delete(`/demandes/${request.id}`);

        assert.strictEqual(status, 204);

        const updated = await prisma.fosterRequest.findUnique({ where: { id: request.id } });
        assert.strictEqual(updated?.status, "cancelled");
    });

    it("should return 403 if another foster tries to cancel", async () => {
        const foster = await createFosterUser();
        const otherFoster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "pending" },
        });

        const requester = buildAuthedRequester({ id: otherFoster.id, role: "foster" });
        const { status } = await requester.delete(`/demandes/${request.id}`);

        assert.strictEqual(status, 403);
    });

    it("should return 403 if authenticated as an association", async () => {
        const association = await createAssociationUser();
        const requester = buildAuthedRequester({ id: association.id, role: "association" });

        const { status } = await requester.delete("/demandes/1");

        assert.strictEqual(status, 403);
    });

    it("should return 409 if the request has already been treated", async () => {
        const foster = await createFosterUser();
        const association = await createAssociationUser();
        const species = await createSpecies();
        const animal = await createAnimal(association.id, species.id);
        const request = await prisma.fosterRequest.create({
            data: { fosterId: foster.id, animalId: animal.id, status: "accepted" },
        });

        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });
        const { status } = await requester.delete(`/demandes/${request.id}`);

        assert.strictEqual(status, 409);
    });

    it("should return 404 for an unknown request", async () => {
        const foster = await createFosterUser();
        const requester = buildAuthedRequester({ id: foster.id, role: "foster" });

        const { status } = await requester.delete("/demandes/99999");

        assert.strictEqual(status, 404);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.delete("/demandes/1");
        assert.strictEqual(status, 401);
    });
});