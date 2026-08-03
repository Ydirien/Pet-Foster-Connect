import assert from "node:assert";
import { describe, it } from "node:test";

const BASE_URL = `http://localhost:${process.env.PORT ?? 7357}/api`;

function baseAssociationPayload(overrides: Record<string, unknown> = {}) {
    return {
        role: "association",
        email: `xss-${Date.now()}-${Math.random()}@example.com`,
        password: "Motdepasse123",
        confirm: "Motdepasse123",
        city: "Lyon",
        name: "Refuge Lyonnais",
        ...overrides,
    };
}

async function registerAssociation(payload: Record<string, unknown>) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return response.json();
}

describe("xssSanitizer", () => {
    it("should strip <script> tags from a string field", async () => {
        const data = await registerAssociation(
            baseAssociationPayload({ name: "Refuge <script>alert('xss')</script> Lyonnais" }),
        );

        assert.ok(data.profile.name, "L'association doit être créée");
        assert.ok(!data.profile.name.includes("<script>"));
        assert.ok(!data.profile.name.includes("alert("));
    });

    it("should strip onerror event handler from attributes", async () => {
        const data = await registerAssociation(
            baseAssociationPayload({ name: 'Refuge <img src="x" onerror="alert(1)"> Lyonnais' }),
        );

        assert.ok(data.profile.name);
        assert.ok(!data.profile.name.includes("onerror"));
        assert.ok(!data.profile.name.includes("alert("));
    });

    it("should strip javascript: protocol from href attributes", async () => {
        const data = await registerAssociation(
            baseAssociationPayload({
                description: `Cliquez <a href="javascript:stealCookies()">ici</a> pour continuer`,
            }),
        );

        assert.ok(data.profile.description);
        assert.ok(!data.profile.description.includes("javascript:"));
    });

    it("should not alter plain text without HTML", async () => {
        const data = await registerAssociation(baseAssociationPayload({ name: "Refuge des Pattes" }));

        assert.strictEqual(data.profile.name, "Refuge des Pattes");
    });

    it("should sanitize all string fields in the same request body", async () => {
        const data = await registerAssociation(
            baseAssociationPayload({
                name: "Refuge <script>evil()</script> Test",
                description: 'Desc <img src="x" onclick="steal()"> text',
            }),
        );

        assert.ok(!data.profile.name.includes("<script>"));
        assert.ok(!data.profile.description.includes("onclick"));
    });
});