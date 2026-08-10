import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";

// Petit composant de test qui affiche l'état d'authentification et permet
// de déclencher un login, pour pouvoir tester le AuthProvider comme le
// ferait un vrai composant de l'application.
function TestConsumer() {
    const { user, isAuthenticated, login } = useAuth();

    return (
        <div>
            <p>{isAuthenticated ? "Connecté" : "Déconnecté"}</p>
            <p>{user?.email ?? "Aucun utilisateur"}</p>
            <button
                type="button"
                onClick={() => login("mon-token", { id: 1, email: "camille@email.com", role: "foster" })}
            >
                Se connecter
            </button>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("démarre déconnecté quand aucun utilisateur n'est stocké", () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        expect(screen.getByText("Déconnecté")).toBeInTheDocument();
        expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument();
    });

    it("stocke le token et l'utilisateur dans le localStorage après un login", async () => {
        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await user.click(screen.getByRole("button", { name: "Se connecter" }));

        expect(screen.getByText("Connecté")).toBeInTheDocument();
        expect(screen.getByText("camille@email.com")).toBeInTheDocument();
        expect(localStorage.getItem("accessToken")).toBe("mon-token");
    });
});
