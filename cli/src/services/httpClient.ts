// L'API lit le JWT via l'en-tête Authorization (pas de cookie, cf. auth.middleware.ts).
export function authHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// À appeler chaque fois qu'une requête authentifiée renvoie 401 : le token
// stocké est invalide/expiré, le garder ne ferait que reproduire l'erreur
// en boucle sur chaque page qui en dépend.
export function clearAccessToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
}