import type { Animal } from "./Animal";

export type FosterRequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface FosterRequest {
    id: number;
    requestedAt: string;
    status: FosterRequestStatus;
    message: string | null;
    fosterId: number;
    animalId: number;
    animal: Animal;
    foster?: {
        firstName: string;
        lastName: string;
        imageUrl: string | null;
    };
}

export interface CreateFosterRequestInput {
    animalId: number;
    message?: string;
}