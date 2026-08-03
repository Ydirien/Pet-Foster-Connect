import assert from "node:assert";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { anonymousRequester, buildAuthedRequester } from "../../tests/index.ts";

let counter = 0;

function validFosterPayload(overrides: Record<string, unknown> = {}) {
    counter++;
    return {
        role: "foster",
        firstName: "Camille",
        lastName: "Martin",
        email: `foster-${counter}@example.com`,
        password: "Motdepasse123",
        confirm: "Motdepasse123",
        city: "Lyon",
        ...overrides,
    };
}

function validAssociationPayload(overrides: Record<string, unknown> = {}) {
    counter++;
    return {
        role: "association",
        name: `Refuge ${counter}`,
        email: `asso-${counter}@example.com`,
        password: "Motdepasse123",
        confirm: "Motdepasse123",
        city: "Lyon",
        ...overrides,
    };
}

async function createFosterUser(password = "Motdepasse123") {
    counter++;
    return prisma.user.create({
        data: {
            email: `existing-foster-${counter}@example.com`,
            password: await argon2.hash(password),
            foster: { create: { firstName: "Camille", lastName: "Martin", city: "Lyon" } },
        },
    });
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/register", () => {
    it("should register a new foster and return its profile without the password", async () => {
        const { data, status } = await anonymousRequester.post(
            "/auth/register",
            validFosterPayload(),
        );

        assert.strictEqual(status, 201);
        assert.strictEqual(data.role, "foster");
        assert.strictEqual(data.profile.firstName, "Camille");
        assert.strictEqual("password" in data, false);
    });

    it("should hash the password with Argon2", async () => {
        const payload = validFosterPayload();
        await anonymousRequester.post("/auth/register", payload);

        const user = await prisma.user.findFirstOrThrow({ where: { email: payload.email } });

        assert.notStrictEqual(user.password, payload.password);
        assert.ok(await argon2.verify(user.password, payload.password));
    });

    it("should register a new association and return its profile", async () => {
        const { data, status } = await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload({ siret: "12345678901234" }),
        );

        assert.strictEqual(status, 201);
        assert.strictEqual(data.role, "association");
        assert.strictEqual(data.profile.siret, "12345678901234");
    });

    it("should allow an association without a SIRET", async () => {
        const { data, status } = await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload(),
        );

        assert.strictEqual(status, 201);
        assert.strictEqual(data.profile.siret, null);
    });

    it("should return 409 if the email is already used", async () => {
        const payload = validFosterPayload();
        await anonymousRequester.post("/auth/register", payload);

        const { status } = await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload({ email: payload.email }),
        );

        assert.strictEqual(status, 409);
    });

    it("should return 409 if the SIRET is already used", async () => {
        await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload({ siret: "12345678901234" }),
        );

        const { status } = await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload({ siret: "12345678901234" }),
        );

        assert.strictEqual(status, 409);
    });

    it("should return 400 if the password is too short", async () => {
        const { status } = await anonymousRequester.post(
            "/auth/register",
            validFosterPayload({ password: "Short1", confirm: "Short1" }),
        );

        assert.strictEqual(status, 400);
    });

    it("should return 400 if confirm does not match password", async () => {
        const { status } = await anonymousRequester.post(
            "/auth/register",
            validFosterPayload({ confirm: "AutreMotdepasse123" }),
        );

        assert.strictEqual(status, 400);
    });

    it("should return 400 for an invalid email", async () => {
        const { status } = await anonymousRequester.post(
            "/auth/register",
            validFosterPayload({ email: "pas-un-email" }),
        );

        assert.strictEqual(status, 400);
    });

    it("should return 400 for an invalid SIRET format", async () => {
        const { status } = await anonymousRequester.post(
            "/auth/register",
            validAssociationPayload({ siret: "123" }),
        );

        assert.strictEqual(status, 400);
    });

    it("should return 400 if the role is missing or invalid", async () => {
        const { status } = await anonymousRequester.post("/auth/register", {
            email: "no-role@example.com",
            password: "Motdepasse123",
            confirm: "Motdepasse123",
            city: "Lyon",
        });

        assert.strictEqual(status, 400);
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/login", () => {
    it("should return an access token and set the accessToken cookie", async () => {
        const user = await createFosterUser("MotDePasse123");

        const response = await anonymousRequester.post("/auth/login", {
            email: user.email,
            password: "MotDePasse123",
        });

        assert.strictEqual(response.status, 200);
        assert.match(
            response.data.accessToken.token,
            /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        );

        const setCookie = response.headers["set-cookie"] ?? [];
        assert.ok(setCookie.some((c: string) => c.startsWith("accessToken=")));
    });

    it("should return a refresh token and store it in the database", async () => {
        const user = await createFosterUser("MotDePasse123");

        const response = await anonymousRequester.post("/auth/login", {
            email: user.email,
            password: "MotDePasse123",
        });

        assert.ok(response.data.refreshToken.token);

        const stored = await prisma.refreshToken.findFirst({ where: { userId: user.id } });
        assert.ok(stored);
        assert.ok(stored.expiresAt > new Date());
    });

    it("should return the same error message for a wrong password and an unknown email", async () => {
        const user = await createFosterUser("MotDePasse123");

        const wrongPassword = await anonymousRequester.post("/auth/login", {
            email: user.email,
            password: "MauvaisMotDePasse1",
        });
        const unknownEmail = await anonymousRequester.post("/auth/login", {
            email: "inconnu@example.com",
            password: "MotDePasse123",
        });

        assert.strictEqual(wrongPassword.status, 401);
        assert.strictEqual(unknownEmail.status, 401);
        assert.strictEqual(wrongPassword.data.error, unknownEmail.data.error);
    });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe("[GET] /api/auth/me", () => {
    it("should return the authenticated user without the password", async () => {
        const user = await createFosterUser();
        const requester = buildAuthedRequester({ id: user.id, role: "foster" });

        const { data, status } = await requester.get("/auth/me");

        assert.strictEqual(status, 200);
        assert.strictEqual(data.id, user.id);
        assert.strictEqual("password" in data, false);
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.get("/auth/me");
        assert.strictEqual(status, 401);
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/logout", () => {
    it("should delete the refresh tokens and clear the cookies", async () => {
        const user = await createFosterUser();
        await prisma.refreshToken.create({
            data: {
                token: "some-refresh-token",
                userId: user.id,
                expiresAt: new Date(Date.now() + 60_000),
            },
        });
        const requester = buildAuthedRequester({ id: user.id, role: "foster" });

        const response = await requester.post("/auth/logout");

        assert.strictEqual(response.status, 204);

        const remaining = await prisma.refreshToken.findMany({ where: { userId: user.id } });
        assert.strictEqual(remaining.length, 0);

        const setCookie = response.headers["set-cookie"] ?? [];
        assert.ok(setCookie.some((c: string) => c.startsWith("accessToken=;")));
    });

    it("should return 401 if not authenticated", async () => {
        const { status } = await anonymousRequester.post("/auth/logout");
        assert.strictEqual(status, 401);
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/refresh", () => {
    it("should generate new tokens from a valid refresh token", async () => {
        const user = await createFosterUser("MotDePasse123");
        const login = await anonymousRequester.post("/auth/login", {
            email: user.email,
            password: "MotDePasse123",
        });
        const refreshToken = login.data.refreshToken.token;

        const { data, status } = await anonymousRequester.post("/auth/refresh", { refreshToken });

        assert.strictEqual(status, 200);
        assert.match(
            data.accessToken.token,
            /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
        );
        assert.ok(data.refreshToken.token);
    });

    it("should return 401 if no refresh token is provided", async () => {
        const { status } = await anonymousRequester.post("/auth/refresh", {});
        assert.strictEqual(status, 401);
    });

    it("should return 401 for an unknown refresh token", async () => {
        const { status } = await anonymousRequester.post("/auth/refresh", {
            refreshToken: "token-inexistant",
        });
        assert.strictEqual(status, 401);
    });

    it("should return 401 and delete an expired refresh token", async () => {
        const user = await createFosterUser();
        await prisma.refreshToken.create({
            data: {
                token: "expired-token",
                userId: user.id,
                expiresAt: new Date(Date.now() - 60_000),
            },
        });

        const { status } = await anonymousRequester.post("/auth/refresh", {
            refreshToken: "expired-token",
        });

        assert.strictEqual(status, 401);

        const remaining = await prisma.refreshToken.findUnique({
            where: { id: (await prisma.refreshToken.findFirst({ where: { userId: user.id } }))?.id ?? -1 },
        });
        assert.strictEqual(remaining, null);
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/forgot-password", () => {
    it("should create a reset token for a known email", async () => {
        const user = await createFosterUser();

        const { status } = await anonymousRequester.post("/auth/forgot-password", {
            email: user.email,
        });

        assert.strictEqual(status, 204);

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { userId: user.id },
        });
        assert.ok(resetToken);
    });

    it("should return 204 without leaking whether the email exists", async () => {
        const { status } = await anonymousRequester.post("/auth/forgot-password", {
            email: "inconnu@example.com",
        });

        assert.strictEqual(status, 204);
    });
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------

describe("[POST] /api/auth/reset-password", () => {
    it("should update the password with a valid token", async () => {
        const user = await createFosterUser("AncienMotDePasse1");
        await prisma.passwordResetToken.create({
            data: {
                token: "valid-reset-token",
                userId: user.id,
                expiresAt: new Date(Date.now() + 60_000),
            },
        });

        const { status } = await anonymousRequester.post("/auth/reset-password", {
            token: "valid-reset-token",
            newPassword: "NouveauMotDePasse1",
        });

        assert.strictEqual(status, 204);

        const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        assert.ok(await argon2.verify(updated.password, "NouveauMotDePasse1"));
    });

    it("should delete the token after use (single use)", async () => {
        const user = await createFosterUser();
        await prisma.passwordResetToken.create({
            data: {
                token: "single-use-token",
                userId: user.id,
                expiresAt: new Date(Date.now() + 60_000),
            },
        });

        await anonymousRequester.post("/auth/reset-password", {
            token: "single-use-token",
            newPassword: "NouveauMotDePasse1",
        });

        const remaining = await prisma.passwordResetToken.findFirst({
            where: { token: "single-use-token" },
        });
        assert.strictEqual(remaining, null);
    });

    it("should return 401 for an unknown token", async () => {
        const { status } = await anonymousRequester.post("/auth/reset-password", {
            token: "token-inexistant",
            newPassword: "NouveauMotDePasse1",
        });

        assert.strictEqual(status, 401);
    });

    it("should return 401 for an expired token", async () => {
        const user = await createFosterUser();
        await prisma.passwordResetToken.create({
            data: {
                token: "expired-reset-token",
                userId: user.id,
                expiresAt: new Date(Date.now() - 60_000),
            },
        });

        const { status } = await anonymousRequester.post("/auth/reset-password", {
            token: "expired-reset-token",
            newPassword: "NouveauMotDePasse1",
        });

        assert.strictEqual(status, 401);
    });

    it("should return 400 if the new password does not meet the policy", async () => {
        const { status } = await anonymousRequester.post("/auth/reset-password", {
            token: "peu-importe",
            newPassword: "faible",
        });

        assert.strictEqual(status, 400);
    });
});