export type Gender = "male" | "female";
export type AnimalStatus = "available" | "in_foster_care" | "completed";

export interface Species {
    id: number;
    name: string;
}

export interface Animal {
    id: number;
    slug: string;
    name: string;
    breed: string | null;
    gender: Gender;
    neutered: boolean;
    age: number | null;
    behavior: string | null;
    specificNeeds: string | null;
    status: AnimalStatus;
    imageUrl: string | null;
    species: Species;
    association: {
        userId: number;
        slug: string;
        name: string;
        imageUrl: string | null;
        city: string;
    };
}

export interface AnimalFilters {
    speciesId?: number;
    city?: string;
    breed?: string;
    status?: AnimalStatus;
    gender?: Gender;
    neutered?: boolean;
    ageCategory?: "puppy" | "adult" | "senior";
    lat?: number;
    lng?: number;
    radiusKm?: number;
}

export interface CreateAnimalInput {
    name: string;
    breed?: string;
    gender: Gender;
    neutered?: boolean;
    age?: number;
    behavior?: string;
    specificNeeds?: string;
    imageUrl?: string;
    speciesId: number;
    incompatibleSpeciesIds?: number[];
}

export type UpdateAnimalInput = Partial<CreateAnimalInput> & {
    status?: AnimalStatus;
};