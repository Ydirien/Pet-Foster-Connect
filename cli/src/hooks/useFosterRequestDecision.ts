import { useState } from "react";
import { updateFosterRequestStatus } from "../services/fosterRequestService";
import type { FosterRequest } from "../types/FosterRequest";

// Partagé entre ReceivedRequests (liste) et CandidateProfile (détail) : les
// deux écrans laissent une association accepter/refuser une demande reçue.
export function useFosterRequestDecision() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function decide(
        requestId: number,
        status: "accepted" | "rejected",
    ): Promise<FosterRequest | null> {
        setIsUpdating(true);
        setError(null);
        try {
            return await updateFosterRequestStatus(requestId, status);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
            return null;
        } finally {
            setIsUpdating(false);
        }
    }

    return { decide, isUpdating, error, setError };
}