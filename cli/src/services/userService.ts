import type { CurrentUser } from "../types/Auth";
import type {
    AddHouseholdPetInput,
    FosterProfileForAssociation,
    HouseholdPet,
    UpdateFosterProfileInput,
} from "../types/Foster";
import { authHeaders, clearAccessToken } from "./httpClient";

export async function getCurrentUser(): Promise<CurrentUser> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        throw new Error("Impossible de récupérer votre profil.");
    }

    return res.json();
}

export async function uploadProfilePhoto(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/photo`, {
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

export async function updateFosterProfile(input: UpdateFosterProfileInput) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 400) throw new Error("Le formulaire contient des erreurs.");
        throw new Error("Impossible de mettre à jour votre profil.");
    }

    return res.json();
}

export async function addHouseholdPet(input: AddHouseholdPetInput): Promise<HouseholdPet> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/animaux-foyer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 400) throw new Error("Espèce inconnue.");
        throw new Error("Impossible d'ajouter cet animal à votre foyer.");
    }

    return res.json();
}

export async function removeHouseholdPet(petId: number): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/animaux-foyer/${petId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Cet animal n'appartient pas à votre foyer.");
        if (res.status === 404) throw new Error("Cet animal du foyer n'existe pas ou plus.");
        throw new Error("Impossible de supprimer cet animal de votre foyer.");
    }
}

export async function deleteCurrentUser(): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        throw new Error("Impossible de supprimer votre compte.");
    }
}

// Profil d'une famille d'accueil, vu par une association liée par une demande
// d'accueil (voir users.controller.ts::getFosterProfileForAssociation).
export async function getFosterProfileForAssociation(
    fosterId: number,
): Promise<FosterProfileForAssociation> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${fosterId}`, {
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à voir ce profil.");
        if (res.status === 404) throw new Error("Cette famille d'accueil n'existe pas.");
        throw new Error("Impossible de récupérer ce profil.");
    }

    return res.json();
}