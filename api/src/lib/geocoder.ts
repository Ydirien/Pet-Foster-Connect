import { logger } from "./logger.ts";

export interface GeocodeResult {
    latitude: number;
    longitude: number;
}

// Géocode une ville (+ code postal si connu) via l'API Adresse du gouvernement
// français (api-adresse.data.gouv.fr) : gratuite, sans clé, taillée pour ce
// cas d'usage. Best-effort : ne doit jamais faire échouer l'appelant (register/
// update de profil) si le service est indisponible ou lent, d'où le timeout
// court et le try/catch qui renvoie simplement null.
export const geocoder = {
    async geocode(city: string, postalCode?: string | null): Promise<GeocodeResult | null> {
        const query = postalCode ? `${city} ${postalCode}` : city;

        try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=1`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return null;

        const data = (await res.json()) as {
            features?: { geometry?: { coordinates?: unknown } }[];
        };
        const coordinates = data.features?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

        const [longitude, latitude] = coordinates;
        if (typeof latitude !== "number" || typeof longitude !== "number") return null;

        return { latitude, longitude };
        } catch (err) {
        logger.warn("Geocoding failed, continuing without coordinates", {
            city,
            postalCode,
            error: err instanceof Error ? err.message : String(err),
        });
        return null;
        }
    },
};

export type Geocoder = typeof geocoder;