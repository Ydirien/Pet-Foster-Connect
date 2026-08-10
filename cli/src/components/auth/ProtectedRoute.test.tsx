import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../context/useAuth";
import type { AuthContextValue } from "../../context/useAuth";

vi.mock("../../context/useAuth", () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute() {
    return render(
        <MemoryRouter initialEntries={["/protege"]}>
            <Routes>
                <Route
                    path="/protege"
                    element={
                        <ProtectedRoute role="association">
                            <p>Contenu protégé</p>
                        </ProtectedRoute>
                    }
                />
                <Route path="/connexion" element={<p>Page de connexion</p>} />
                <Route path="/" element={<p>Page d'accueil</p>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("ProtectedRoute", () => {
    beforeEach(() => {
        mockedUseAuth.mockReset();
    });

    it("redirige vers /connexion si l'utilisateur n'est pas connecté", () => {
        mockedUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
        } as AuthContextValue);

        renderProtectedRoute();

        expect(screen.getByText("Page de connexion")).toBeInTheDocument();
    });

    it("redirige vers l'accueil si le rôle de l'utilisateur ne correspond pas", () => {
        mockedUseAuth.mockReturnValue({
            user: { id: 1, email: "a@a.com", role: "foster" },
            isAuthenticated: true,
        } as AuthContextValue);

        renderProtectedRoute();

        expect(screen.getByText("Page d'accueil")).toBeInTheDocument();
    });

    it("affiche le contenu protégé si l'utilisateur a le bon rôle", () => {
        mockedUseAuth.mockReturnValue({
            user: { id: 1, email: "a@a.com", role: "association" },
            isAuthenticated: true,
        } as AuthContextValue);

        renderProtectedRoute();

        expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
    });
});
