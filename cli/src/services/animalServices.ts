import type { Animal, AnimalFilters, CreateAnimalInput, Species, UpdateAnimalInput } from "../types/Animal";
import { authHeaders, clearAccessToken } from "./httpClient";

export async function getSpecies(): Promise<Species[]> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/especes`);
    if (!res.ok) throw new Error("Impossible de récupérer la liste des espèces.");
    return res.json();
}

function buildQuery(filters: AnimalFilters): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
    }
    return params.toString();
}

export async function listAnimals(filters: AnimalFilters = {}): Promise<Animal[]> {
    const query = buildQuery(filters);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux${query ? `?${query}` : ""}`);
    if (!res.ok) throw new Error("Impossible de récupérer les animaux.");
    return res.json();
}

export async function getAnimalBySlug(slug: string): Promise<Animal> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux/${slug}`);
    if (!res.ok) {
        if (res.status === 404) throw new Error("Cet animal n'existe pas ou plus.");
        throw new Error("Impossible de récupérer cet animal.");
    }
    return res.json();
}

export async function createAnimal(input: CreateAnimalInput): Promise<Animal> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 400) throw new Error("Le formulaire contient des erreurs.");
        throw new Error("Impossible de publier cet animal.");
    }

    return res.json();
}

export async function uploadAnimalImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux/upload`, {
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

export async function updateAnimal(id: number, input: UpdateAnimalInput): Promise<Animal> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à modifier cet animal.");
        if (res.status === 404) throw new Error("Cet animal n'existe pas ou plus.");
        throw new Error("Impossible de modifier cet animal.");
    }

    return res.json();
}

export async function deleteAnimal(id: number): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/animaux/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
    });

    if (!res.ok) {
        if (res.status === 401) clearAccessToken();
        if (res.status === 403) throw new Error("Vous n'êtes pas autorisé à supprimer cet animal.");
        throw new Error("Impossible de supprimer cet animal.");
    }
}