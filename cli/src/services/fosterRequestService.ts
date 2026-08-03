import type { CreateFosterRequestInput, FosterRequest } from "../types/FosterRequest";
import { authHeaders, clearAccessToken } from "./httpClient";

export async function createFosterRequest(input: CreateFosterRequestInput): Promise<FosterRequest> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/demandes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 409) throw new Error("Une demande active existe déjà pour cet animal.");
        if (res.status === 404) throw new Error("Cet animal n'existe pas ou plus.");
        throw new Error("Impossible d'envoyer votre demande.");
    }

    return res.json();
}

export async function listFosterRequests(): Promise<FosterRequest[]> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/demandes`, {
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        throw new Error("Impossible de récupérer les demandes.");
    }

    return res.json();
}

export async function getFosterRequestById(id: number): Promise<FosterRequest> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/demandes/${id}`, {
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas concerné par cette demande.");
        if (res.status === 404) throw new Error("Cette demande n'existe pas ou plus.");
        throw new Error("Impossible de récupérer cette demande.");
    }

    return res.json();
}

export async function updateFosterRequestStatus(
    id: number,
    status: "accepted" | "rejected",
): Promise<FosterRequest> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/demandes/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à traiter cette demande.");
        if (res.status === 409) throw new Error("Cette demande a déjà été traitée.");
        throw new Error("Impossible de mettre à jour cette demande.");
    }

    return res.json();
}

export async function cancelFosterRequest(id: number): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/demandes/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à annuler cette demande.");
        if (res.status === 409) throw new Error("Cette demande a déjà été traitée.");
        throw new Error("Impossible d'annuler cette demande.");
    }
}