import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFosterRequestDecision } from "./useFosterRequestDecision";
import { updateFosterRequestStatus } from "../services/fosterRequestService";
import type { FosterRequest } from "../types/FosterRequest";

vi.mock("../services/fosterRequestService", () => ({
    updateFosterRequestStatus: vi.fn(),
}));

const mockedUpdate = vi.mocked(updateFosterRequestStatus);

describe("useFosterRequestDecision", () => {
    beforeEach(() => {
        mockedUpdate.mockReset();
    });

    it("retourne la demande mise à jour quand l'appel réussit", async () => {
        const updatedRequest = { id: 1, status: "accepted" } as FosterRequest;
        mockedUpdate.mockResolvedValue(updatedRequest);

        const { result } = renderHook(() => useFosterRequestDecision());

        let response: FosterRequest | null = null;
        await act(async () => {
            response = await result.current.decide(1, "accepted");
        });

        expect(response).toEqual(updatedRequest);
        expect(result.current.error).toBeNull();
        expect(result.current.isUpdating).toBe(false);
    });

    it("stocke un message d'erreur et renvoie null quand l'appel échoue", async () => {
        mockedUpdate.mockRejectedValue(new Error("Cette demande a déjà été traitée."));

        const { result } = renderHook(() => useFosterRequestDecision());

        let response: FosterRequest | null = null;
        await act(async () => {
            response = await result.current.decide(1, "rejected");
        });

        expect(response).toBeNull();
        await waitFor(() => {
            expect(result.current.error).toBe("Cette demande a déjà été traitée.");
        });
    });
});
