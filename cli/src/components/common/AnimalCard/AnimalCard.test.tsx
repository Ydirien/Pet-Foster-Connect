import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AnimalCard } from "./AnimalCard";
import type { Animal } from "../../../types/Animal";

const baseAnimal: Animal = {
    id: 1,
    slug: "rex",
    name: "Rex",
    breed: "Labrador",
    gender: "male",
    neutered: true,
    age: 3,
    behavior: null,
    specificNeeds: null,
    status: "available",
    imageUrl: "https://example.com/rex.jpg",
    species: { id: 1, name: "Chien" },
    association: {
        userId: 1,
        slug: "les-amis-des-betes",
        name: "Les Amis des Bêtes",
        imageUrl: null,
        city: "Lyon",
    },
};

function renderAnimalCard(animal: Animal) {
    return render(
        <MemoryRouter>
            <AnimalCard animal={animal} />
        </MemoryRouter>,
    );
}

describe("AnimalCard", () => {
    it("affiche le nom, l'âge et l'association de l'animal", () => {
        renderAnimalCard(baseAnimal);

        expect(screen.getByText("Rex")).toBeInTheDocument();
        expect(screen.getByText("3 ans")).toBeInTheDocument();
        expect(screen.getByText("Les Amis des Bêtes")).toBeInTheDocument();
    });

    it("affiche 'Inconnu' quand l'âge n'est pas renseigné", () => {
        renderAnimalCard({ ...baseAnimal, age: null });

        expect(screen.getByText("Inconnu")).toBeInTheDocument();
    });

    it("pointe vers la page de détail de l'animal via son slug", () => {
        renderAnimalCard(baseAnimal);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/animaux/rex");
    });
});
