import assert from "node:assert";
import { describe, it } from "node:test";
import { generateAccessToken, verifyAccessToken, generateRefreshToken } from "./tokens.ts";

const SECRET = "test-secret";

describe("generateAccessToken / verifyAccessToken", () => {
    it("should produce a token that verifies back to the same payload", () => {
        const accessToken = generateAccessToken({ id: 7, role: "foster" }, SECRET);
        const payload = verifyAccessToken(accessToken.token, SECRET);

        assert.strictEqual(payload.id, 7);
        assert.strictEqual(payload.role, "foster");
    });

    it("should reject a token signed with a different secret", () => {
        const accessToken = generateAccessToken({ id: 7, role: "foster" }, SECRET);

        assert.throws(() => verifyAccessToken(accessToken.token, "wrong-secret"));
    });

    it("should reject a token that is not a valid JWT", () => {
        assert.throws(() => verifyAccessToken("not-a-real-token", SECRET));
    });
});

describe("generateRefreshToken", () => {
    it("should generate a random hexadecimal token", () => {
        const refreshToken = generateRefreshToken();
        assert.match(refreshToken.token, /^[0-9a-f]+$/);
    });

    it("should not generate the same token twice in a row", () => {
        const first = generateRefreshToken();
        const second = generateRefreshToken();
        assert.notStrictEqual(first.token, second.token);
    });
});
