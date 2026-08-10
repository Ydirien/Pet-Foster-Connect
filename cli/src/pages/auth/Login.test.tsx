import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import { AuthProvider } from "../../context/AuthContext";
import { login } from "../../services/AuthService";

vi.mock("../../services/AuthService", () => ({
    login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

function renderLoginPage() {
    return render(
        <MemoryRouter initialEntries={["/connexion"]}>
            <AuthProvider>
                <Routes>
                    <Route path="/connexion" element={<Login />} />
                    <Route path="/compte" element={<p>Page compte</p>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>,
    );
}

async function fillAndSubmit() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "camille@email.com");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse123!");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));
}

describe("Login", () => {
    beforeEach(() => {
        mockedLogin.mockReset();
        localStorage.clear();
    });

    it("affiche un message d'erreur si les identifiants sont invalides", async () => {
        mockedLogin.mockRejectedValue(new Error("Email ou mot de passe incorrect"));

        renderLoginPage();
        await fillAndSubmit();

        expect(await screen.findByText("Email ou mot de passe incorrect")).toBeInTheDocument();
    });

    it("redirige vers la page compte après une connexion réussie", async () => {
        mockedLogin.mockResolvedValue({
            accessToken: { token: "abc", type: "Bearer", expiresInMS: 900000 },
            user: { id: 1, email: "camille@email.com", role: "foster" },
        });

        renderLoginPage();
        await fillAndSubmit();

        expect(await screen.findByText("Page compte")).toBeInTheDocument();
    });
});
