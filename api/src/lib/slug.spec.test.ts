import assert from "node:assert";
import { describe, it } from "node:test";
import { slugify, buildSlug, parseIdFromSlug } from "./slug.ts";

describe("slugify", () => {
    it("should lowercase the text and remove accents", () => {
        assert.strictEqual(slugify("Éléphant"), "elephant");
    });

    it("should replace special characters with dashes", () => {
        assert.strictEqual(slugify("Refuge de l'Espoir !"), "refuge-de-l-espoir");
    });

    it("should not leave a leading or trailing dash", () => {
        assert.strictEqual(slugify("  Rex  "), "rex");
    });
});

describe("buildSlug", () => {
    it("should combine the slugified name and the id", () => {
        assert.strictEqual(buildSlug(3, "Rex"), "rex-3");
    });

    it("should fall back to the id alone when the name has no valid character", () => {
        assert.strictEqual(buildSlug(3, "!!!"), "3");
    });
});

describe("parseIdFromSlug", () => {
    it("should extract the id at the end of a slug", () => {
        assert.strictEqual(parseIdFromSlug("rex-le-chien-3"), 3);
    });

    it("should accept a raw numeric id without a name", () => {
        assert.strictEqual(parseIdFromSlug("42"), 42);
    });

    it("should return null when there is no id to extract", () => {
        assert.strictEqual(parseIdFromSlug("rex-le-chien"), null);
    });
});
