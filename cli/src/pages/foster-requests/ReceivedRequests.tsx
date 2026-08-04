import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listFosterRequests } from "../../services/fosterRequestService";
import { useFosterRequestDecision } from "../../hooks/useFosterRequestDecision";
import type { FosterRequest } from "../../types/FosterRequest";
import "./ReceivedRequests.css";

type Filter = "all" | "pending" | "done";

export function ReceivedRequests() {
    const [requests, setRequests] = useState<FosterRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const navigate = useNavigate();
    const { decide, isUpdating, error: decisionError } = useFosterRequestDecision();

    useEffect(() => {
        listFosterRequests()
            .then(setRequests)
            .catch((err) => setLoadError(err instanceof Error ? err.message : "Une erreur est survenue."))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleDecision(requestId: number, status: "accepted" | "rejected") {
        const updated = await decide(requestId, status);
        if (!updated) return;
        setRequests((current) =>
            current.map((request) => (request.id === requestId ? { ...request, status } : request)),
        );
    }

    const error = loadError ?? decisionError;

    if (isLoading) return <p className="received-requests__state">Chargement...</p>;
    if (loadError && requests.length === 0) return <p className="received-requests__state">{loadError}</p>;

    const pendingCount = requests.filter((request) => request.status === "pending").length;
    const doneCount = requests.length - pendingCount;

    const visibleRequests = requests.filter((request) => {
        if (filter === "pending") return request.status === "pending";
        if (filter === "done") return request.status !== "pending";
        return true;
    });

    return (
        <section className="received-requests">
            <h1 className="received-requests__title">Demandes reçues</h1>
            <p className="received-requests__subtitle">
                {requests.length} demande{requests.length > 1 ? "s" : ""} au total
            </p>

            <div className="received-requests__tabs">
                <button
                    type="button"
                    className={`received-requests__tab${filter === "all" ? " received-requests__tab--active" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    Toutes ({requests.length})
                </button>
                <button
                    type="button"
                    className={`received-requests__tab${filter === "pending" ? " received-requests__tab--active" : ""}`}
                    onClick={() => setFilter("pending")}
                >
                    En attente ({pendingCount})
                </button>
                <button
                    type="button"
                    className={`received-requests__tab${filter === "done" ? " received-requests__tab--active" : ""}`}
                    onClick={() => setFilter("done")}
                >
                    Traitées ({doneCount})
                </button>
            </div>

            {error && <p className="received-requests__error">{error}</p>}

            {visibleRequests.length === 0 ? (
                <p className="received-requests__state">Aucune demande à afficher.</p>
            ) : (
                <div className="received-requests__list">
                    {visibleRequests.map((request) => (
                        <article key={request.id} className="request-card">
                            <div className="request-card__header">
                                {request.foster?.imageUrl ? (
                                    <img className="request-card__avatar" src={request.foster.imageUrl} alt="" />
                                ) : (
                                    <div className="request-card__avatar request-card__avatar--placeholder" />
                                )}
                                <div className="request-card__identity">
                                    <p className="request-card__name">
                                        {request.foster?.firstName} {request.foster?.lastName}
                                    </p>
                                </div>
                                <p className="request-card__date">
                                    {new Date(request.requestedAt).toLocaleDateString("fr-FR")}
                                </p>
                            </div>

                            <p className="request-card__wish">
                                Souhaite accueillir <strong>{request.animal.name}</strong>
                            </p>

                            {request.message && (
                                <p className="request-card__message">&ldquo;{request.message}&rdquo;</p>
                            )}

                            <button
                                type="button"
                                className="request-card__profile-btn"
                                onClick={() => navigate(`/candidats/${request.id}`)}
                            >
                                Voir le profil
                            </button>

                            {request.status === "pending" ? (
                                <div className="request-card__actions">
                                    <button
                                        type="button"
                                        className="request-card__action request-card__action--reject"
                                        onClick={() => handleDecision(request.id, "rejected")}
                                        disabled={isUpdating}
                                    >
                                        Refuser
                                    </button>
                                    <button
                                        type="button"
                                        className="request-card__action request-card__action--accept"
                                        onClick={() => handleDecision(request.id, "accepted")}
                                        disabled={isUpdating}
                                    >
                                        Accepter
                                    </button>
                                </div>
                            ) : (
                                <p className="request-card__decided">
                                    {request.status === "accepted"
                                        ? "Demande acceptée"
                                        : request.status === "rejected"
                                        ? "Demande refusée"
                                        : "Demande annulée"}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}