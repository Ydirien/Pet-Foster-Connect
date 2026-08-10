import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Démonte les composants rendus après chaque test pour éviter qu'un test
// n'influence le suivant.
afterEach(() => {
    cleanup();
});
