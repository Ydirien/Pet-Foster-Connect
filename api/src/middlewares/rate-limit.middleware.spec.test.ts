import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { RATE_LIMIT, resetRateLimiters } from "./rate-limit.middleware.ts";

const BASE_URL = `http://localhost:${process.env.PORT ?? 7357}/api`;

const invalidLoginPayload = JSON.stringify({
    email: "unknown@test.io",
    password: "wrong",
});
const jsonHeaders = { "Content-Type": "application/json" };

async function postLogin() {
    return fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: jsonHeaders,
        body: invalidLoginPayload,
    });
}

describe("authRateLimiter", () => {
    beforeEach(() => resetRateLimiters());

    it("should include RateLimit headers on rate-limited routes", async () => {
        const response = await postLogin();

        assert.ok(response.headers.get("ratelimit-limit"));
        assert.ok(response.headers.get("ratelimit-remaining"));
        assert.ok(response.headers.get("ratelimit-reset"));
    });

    it("should report the correct limit in the RateLimit-Limit header", async () => {
        const response = await postLogin();

        assert.strictEqual(response.headers.get("ratelimit-limit"), String(RATE_LIMIT));
    });

    it("should decrement RateLimit-Remaining on each request", async () => {
        const r1 = await postLogin();
        const r2 = await postLogin();

        const remaining1 = parseInt(r1.headers.get("ratelimit-remaining") ?? "-1");
        const remaining2 = parseInt(r2.headers.get("ratelimit-remaining") ?? "-1");

        assert.ok(remaining2 < remaining1);
    });

    it("should return 429 after exceeding the limit", async () => {
        for (let i = 0; i < RATE_LIMIT; i++) {
            await postLogin();
        }
        const response = await postLogin();

        assert.strictEqual(response.status, 429);
    });

    it("should return the configured error message on 429", async () => {
        for (let i = 0; i < RATE_LIMIT; i++) {
            await postLogin();
        }
        const response = await postLogin();
        const body = (await response.json()) as { error: string };

        assert.strictEqual(response.status, 429);
        assert.match(body.error, /Trop de tentatives/);
    });

    it("should NOT include RateLimit headers on non-rate-limited routes", async () => {
        const response = await fetch(`${BASE_URL}/especes`);

        assert.strictEqual(response.headers.get("ratelimit-limit"), null);
        assert.strictEqual(response.headers.get("ratelimit-remaining"), null);
    });

    it("login and register should have independent counters", async () => {
        for (let i = 0; i < RATE_LIMIT; i++) {
            await postLogin();
        }

        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
                role: "foster",
                firstName: "A",
                lastName: "B",
                email: `a-${Date.now()}@b.io`,
                password: "Motdepasse123",
                confirm: "Motdepasse123",
                city: "Lyon",
            }),
        });

        assert.notStrictEqual(registerResponse.status, 429);
    });
});