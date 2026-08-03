import assert from "node:assert";
import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";

describe("globalErrorHandler", () => {
    const safePrismaSpeciesFindMany = prisma.species.findMany;

    it("should return a 500 when database is failing", async () => {
        prisma.species.findMany = () => {
            throw new Error("Database error");
        };
        it.mock.method(console, "error", () => {});

        const httpResponse = await fetch(`http://localhost:${process.env.PORT}/api/especes`);
        const body = await httpResponse.json();

        assert.strictEqual(httpResponse.status, 500);
        assert.deepStrictEqual(body, {
            status: 500,
            error: "Internal server error",
        });

        prisma.species.findMany = safePrismaSpeciesFindMany;
    });
});