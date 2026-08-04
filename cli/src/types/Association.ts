import type { Animal } from "./Animal";

export interface Association {
    userId: number;
    slug: string;
    name: string;
    imageUrl: string | null;
    siret: string | null;
    description: string | null;
    address: string | null;
    city: string;
    postalCode: string | null;
    openingHours: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface AssociationDetail extends Association {
    animals: Animal[];
    user: {
        email: string;
        phone: string | null;
    };
}

export interface AssociationFilters {
    lat?: number;
    lng?: number;
    radiusKm?: number;
}

export interface UpdateAssociationInput {
    name?: string;
    imageUrl?: string;
    description?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    openingHours?: string;
}