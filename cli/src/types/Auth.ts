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

        interface CurrentUserBase {
            id: number;
            email: string;
            phone: string | null;
            createdAt: string;
        }

        export interface CurrentFosterUser extends CurrentUserBase {
            role: "foster";
            profile: FosterProfile;
        }

        export interface CurrentAssociationUser extends CurrentUserBase {
            role: "association";
            profile: AssociationCore;
        }

        // Réponse de GET /api/users/me : profil complet selon le rôle.
        export type CurrentUser = CurrentFosterUser | CurrentAssociationUser;