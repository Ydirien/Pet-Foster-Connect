import type { Association, AssociationDetail, AssociationFilters, UpdateAssociationInput } from "../types/Association";
import { authHeaders, clearAccessToken } from "./httpClient";

function buildQuery(filters: AssociationFilters): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
    }
    return params.toString();
}

export async function listAssociations(filters: AssociationFilters = {}): Promise<Association[]> {
    const query = buildQuery(filters);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/associations${query ? `?${query}` : ""}`);
    if (!res.ok) throw new Error("Impossible de récupérer les associations.");
    return res.json();
}

export async function getAssociationBySlug(slug: string): Promise<AssociationDetail> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/associations/${slug}`);
    if (!res.ok) {
        if (res.status === 404) throw new Error("Cette association n'existe pas ou plus.");
        throw new Error("Impossible de récupérer cette association.");
    }
    return res.json();
}

export async function uploadAssociationImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/associations/upload`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: formData,
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        throw new Error("Impossible d'envoyer cette image.");
    }

    return res.json();
}

export async function updateAssociation(
    associationId: number,
    input: UpdateAssociationInput,
): Promise<Association> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/associations/${associationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à modifier ce profil.");
        if (res.status === 404) throw new Error("Cette association n'existe pas ou plus.");
        throw new Error("Impossible de modifier ce profil.");
    }

    return res.json();
}