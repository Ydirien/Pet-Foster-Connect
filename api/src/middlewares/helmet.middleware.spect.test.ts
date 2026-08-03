import assert from "node:assert";
import { describe, it } from "node:test";

const BASE_URL = `http://localhost:${process.env.PORT ?? 7357}/api`;

describe("helmetMiddleware", () => {
    it("should remove the X-Powered-By header", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        assert.strictEqual(response.headers.get("x-powered-by"), null);
    });

    it("should set X-Content-Type-Options: nosniff", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        assert.strictEqual(response.headers.get("x-content-type-options"), "nosniff");
    });

    it("should set X-Frame-Options to deny clickjacking", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        const value = response.headers.get("x-frame-options");
        assert.ok(value);
        assert.match(value, /SAMEORIGIN|DENY/i);
    });

    it("should set X-DNS-Prefetch-Control: off", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        assert.strictEqual(response.headers.get("x-dns-prefetch-control"), "off");
    });

    it("should set a Content-Security-Policy header", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        assert.ok(response.headers.get("content-security-policy"));
    });

    it("should set Cross-Origin-Opener-Policy", async () => {
        const response = await fetch(`${BASE_URL}/especes`);
        assert.ok(response.headers.get("cross-origin-opener-policy"));
    });
});