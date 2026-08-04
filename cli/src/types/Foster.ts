export type HousingType = "house" | "apartment";
export type ExperienceLevel = "beginner" | "confirmed" | "experienced";
export type WalkTime = "less_than_30min" | "between_30min_1h" | "between_1h_2h" | "more_than_2h";
export type HomePresence = "full_time" | "part_time" | "evenings_only" | "variable";

export interface HouseholdPet {
    id: number;
    age: number | null;
    neutered: boolean;
    speciesId: number;
    species: { id: number; name: string };
}

export interface FosterProfile {
    userId: number;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    address: string | null;
    city: string;
    postalCode: string | null;
    housingType: HousingType | null;
    housingSize: number | null;
    hasGarden: boolean;
    gardenSize: number | null;
    walkTime: WalkTime | null;
    homePresence: HomePresence | null;
    experienceLevel: ExperienceLevel | null;
    experienceDescription: string | null;
    monthlyBudget: number | null;
    householdPets?: HouseholdPet[];
}

export interface UpdateFosterProfileInput {
    phone?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    housingType?: HousingType;
    housingSize?: number;
    hasGarden?: boolean;
    gardenSize?: number;
    walkTime?: WalkTime;
    homePresence?: HomePresence;
    experienceLevel?: ExperienceLevel;
    experienceDescription?: string;
    monthlyBudget?: number;
}

export interface AddHouseholdPetInput {
    speciesId: number;
    age?: number;
    neutered?: boolean;
}

// Profil complet, tel que vu par une association liée par une demande
// d'accueil (GET /api/users/:id) : inclut les coordonnées de contact.
export interface FosterProfileForAssociation extends FosterProfile {
    householdPets: HouseholdPet[];
    user: {
        email: string;
        phone: string | null;
        createdAt: string;
    };
}