import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Register } from "./Register";
import { register } from "../../services/AuthService";

vi.mock("../../services/AuthService", () => ({
    register: vi.fn(),
}));

const mockedRegister = vi.mocked(register);

function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>,
    );
}

describe("Register", () => {
    beforeEach(() => {
        mockedRegister.mockReset();
    });

    it("affiche une erreur si les deux mots de passe ne correspondent pas", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.type(screen.getByLabelText("Prénom"), "Camille");
        await user.type(screen.getByLabelText("Nom"), "Dubois");
        await user.type(screen.getByLabelText("Email"), "camille@email.com");
        await user.type(screen.getByLabelText("Mot de passe"), "abcdefghijkl");
        await user.type(screen.getByLabelText("Confirmer le mot de passe"), "abcdefghijkz");
        await user.type(screen.getByLabelText("Ville"), "Lyon");
        await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

        expect(
            await screen.findByText("Les deux mots de passe ne correspondent pas."),
        ).toBeInTheDocument();
        expect(mockedRegister).not.toHaveBeenCalled();
    });

    it("affiche les champs association quand on choisit 'Je suis une association'", async () => {
        const user = userEvent.setup();
        renderRegisterPage();

        await user.click(screen.getByRole("button", { name: "Je suis une association" }));

        expect(screen.getByLabelText("Nom de l'association")).toBeInTheDocument();
        expect(screen.queryByLabelText("Prénom")).not.toBeInTheDocument();
    });
});
