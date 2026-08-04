export interface CitySuggestion {
    label: string;
    postcode: string;
    latitude: number;
    longitude: number;
}

// API Adresse du gouvernement français (api-adresse.data.gouv.fr) : publique,
// gratuite, sans clé. Utilisée uniquement pour l'autocomplétion "ville" du
// filtre de recherche par rayon (façon Leboncoin), directement depuis le
// navigateur — le géocodage des associations, lui, se fait côté backend.
export async function searchCitySuggestions(query: string): Promise<CitySuggestion[]> {
    if (query.trim().length < 2) return [];

    try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return [];

        const data = await res.json();
        const features: unknown[] = Array.isArray(data?.features) ? data.features : [];

        return features
            .map((feature: any) => {
                const coordinates = feature?.geometry?.coordinates;
                if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
                const [longitude, latitude] = coordinates;
                if (typeof latitude !== "number" || typeof longitude !== "number") return null;

                return {
                    label: String(feature.properties?.label ?? ""),
                    postcode: String(feature.properties?.postcode ?? ""),
                    latitude,
                    longitude,
                };
            })
            .filter((suggestion): suggestion is CitySuggestion => suggestion !== null);
    } catch {
        return [];
    }
}