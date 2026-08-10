import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequestStatusBadge } from "./RequestStatusBadge";
import type { FosterRequestStatus } from "../../../types/FosterRequest";

describe("RequestStatusBadge", () => {
    it("affiche 'En attente' avec la classe CSS correspondante pour le statut pending", () => {
        render(<RequestStatusBadge status="pending" />);

        const badge = screen.getByText("En attente");
        expect(badge).toHaveClass("request-status-badge--pending");
    });

    it("affiche le bon libellé pour chaque statut", () => {
        const expectedLabels: Record<FosterRequestStatus, string> = {
            pending: "En attente",
            accepted: "Validée",
            rejected: "Refusée",
            cancelled: "Annulée",
        };

        for (const [status, label] of Object.entries(expectedLabels)) {
            const { unmount } = render(<RequestStatusBadge status={status as FosterRequestStatus} />);
            expect(screen.getByText(label)).toBeInTheDocument();
            unmount();
        }
    });
});
