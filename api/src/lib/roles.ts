export const ROLES = ["foster", "association"] as const;

export type Role = (typeof ROLES)[number];