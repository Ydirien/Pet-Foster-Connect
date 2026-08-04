import type { AssociationCore } from "./Association";
import type { FosterProfile } from "./Foster";

export type UserRole = "foster" | "association";

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
}

export interface AccessToken {
    token: string;
    type: "Bearer";
    expiresInMS: number;
}

export interface LoginResponse {
    accessToken: AccessToken;
    user: AuthUser;
}

interface RegisterCommonFields {
    email: string;
    password: string;
    confirm: string;
    city: string;
    address?: string;
    postalCode?: string;
    phone?: string;
}

export type RegisterInput =
        | (RegisterCommonFields & {
            role: "foster";
            firstName: string;
            lastName: string;
        })
    | (RegisterCommonFields & {
            role: "association";
            name: string;
            siret?: string;
            description?: string;
            openingHours?: string;
        });

        export interface CurrentUser {
            id: number;
            email: string;
            phone: string | null;
            createdAt: string;
            role: UserRole;
            profile: FosterProfile | AssociationCore;
        }