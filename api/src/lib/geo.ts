const EARTH_RADIUS_KM = 6371;

interface Coordinates {
    latitude: number;
    longitude: number;
}

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

// Formule de Haversine : calcule la distance "à vol d'oiseau" entre deux
// points GPS, en tenant compte de la courbure de la Terre.
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
    const deltaLat = toRadians(b.latitude - a.latitude);
    const deltaLng = toRadians(b.longitude - a.longitude);

    const lat1 = toRadians(a.latitude);
    const lat2 = toRadians(b.latitude);

    const h =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(h));

    return EARTH_RADIUS_KM * c;
}