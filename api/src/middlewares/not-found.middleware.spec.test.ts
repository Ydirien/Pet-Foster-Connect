import assert from "node:assert";
import { describe, it } from "node:test";

const BASE_URL = `http://localhost:${process.env.PORT ?? 7357}/api`;

describe("notFoundMiddleware", () => {
    it("should return 404 for an unknown route", async () => {
        const response = await fetch(`${BASE_URL}/route-qui-nexiste-pas`);
        const body = await response.json();

        assert.strictEqual(response.status, 404);
        assert.strictEqual(body.status, 404);
    });
});