import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CityRadiusFilter, type CityRadiusValue } from "./CityRadiusFilter";

describe("CityRadiusFilter", () => {
    it("n'affiche pas le curseur de rayon tant qu'aucune ville n'est sélectionnée", () => {
        const value: CityRadiusValue = { city: null, radiusKm: 25 };
        render(<CityRadiusFilter value={value} onChange={vi.fn()} idPrefix="test" />);

        expect(screen.queryByLabelText(/rayon/i)).not.toBeInTheDocument();
    });

    it("affiche le rayon et prévient le parent quand on déplace le curseur", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const value: CityRadiusValue = {
            city: { label: "Lyon", postcode: "69000", latitude: 45.75, longitude: 4.85 },
            radiusKm: 25,
        };
        render(<CityRadiusFilter value={value} onChange={handleChange} idPrefix="test" />);

        const radiusInput = screen.getByLabelText(/rayon : 25 km autour de lyon/i);
        expect(radiusInput).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /retirer le filtre de ville/i }));

        expect(handleChange).toHaveBeenCalledWith({ city: null, radiusKm: 25 });
    });
});
