import type { LoginResponse, RegisterInput } from "../types/Auth";
import { authHeaders, clearAccessToken } from "./httpClient";

export interface LoginCredentials {
    email: string;
    password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Email ou mot de passe incorrect");
        if (res.status === 429) throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
        throw new Error("Impossible de se connecter, réessayez plus tard");
    }

    return res.json();
}

export async function register(input: RegisterInput): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message: string | undefined = data?.error;

        if (res.status === 409) {
            throw new Error(
                message?.toLowerCase().includes("siret")
                    ? "Ce numéro SIRET est déjà utilisé."
                    : "Cet email est déjà utilisé.",
            );
        }
        if (res.status === 429) throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
        throw new Error(message ?? "Impossible de créer le compte, réessayez plus tard.");
    }
}

export async function requestPasswordReset(email: string): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        if (res.status === 429) throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
        throw new Error("Impossible d'envoyer le lien, réessayez plus tard.");
    }
}

// Le backend supprime les refresh tokens en base et vide les cookies (voir
// auth.controller.ts::logoutUser). On nettoie aussi le stockage local, même
// si la requête échoue (session déjà expirée, hors-ligne...).
export async function logout(): Promise<void> {
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: "POST",
            headers: { ...authHeaders() },
        });
    } finally {
        clearAccessToken();
    }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Lien invalide ou expiré. Demandez un nouveau lien.");
        if (res.status === 429) throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
        throw new Error("Impossible de réinitialiser le mot de passe, réessayez plus tard.");
    }
}