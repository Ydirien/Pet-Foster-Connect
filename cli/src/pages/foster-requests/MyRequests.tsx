import { useEffect, useState } from "react";
import { listFosterRequests, cancelFosterRequest } from "../../services/fosterRequestService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { FosterRequest } from "../../types/FosterRequest";
import { RequestStatusBadge } from "../../components/common/RequestStatusBadge/RequestStatusBadge";
import "./MyRequests.css";

type Filter = "all" | "pending" | "done";

export function MyRequests() {
    const [requests, setRequests] = useState<FosterRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    useDocumentTitle("Mes demandes d'accueil");

    useEffect(() => {
        listFosterRequests()
            .then(setRequests)
            .catch((err) => setError(err instanceof Error ? err.message : "Une erreur est survenue."))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleCancel(requestId: number) {
        if (!window.confirm("Annuler cette demande d'accueil ?")) return;
        try {
            await cancelFosterRequest(requestId);
            setRequests((current) =>
                current.map((request) =>
                    request.id === requestId ? { ...request, status: "cancelled" } : request,
                ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        }
    }

    if (isLoading) return <p className="my-requests__state">Chargement...</p>;
    if (error && requests.length === 0) return <p className="my-requests__state">{error}</p>;

    const pendingCount = requests.filter((request) => request.status === "pending").length;
    const doneCount = requests.length - pendingCount;

    const visibleRequests = requests.filter((request) => {
        if (filter === "pending") return request.status === "pending";
        if (filter === "done") return request.status !== "pending";
        return true;
    });

    return (
        <section className="my-requests">
            <div className="my-requests__inner">
                <h1 className="my-requests__title">Mes demandes d'accueil</h1>
                <p className="my-requests__subtitle">
                    {requests.length} demande{requests.length > 1 ? "s" : ""} au total
                </p>

                <div className="my-requests__tabs" role="group" aria-label="Filtrer les demandes">
                    <button
                        type="button"
                        className={`my-requests__tab${filter === "all" ? " my-requests__tab--active" : ""}`}
                        aria-pressed={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        Toutes ({requests.length})
                    </button>
                    <button
                        type="button"
                        className={`my-requests__tab${filter === "pending" ? " my-requests__tab--active" : ""}`}
                        aria-pressed={filter === "pending"}
                        onClick={() => setFilter("pending")}
                    >
                        En attente ({pendingCount})
                    </button>
                    <button
                        type="button"
                        className={`my-requests__tab${filter === "done" ? " my-requests__tab--active" : ""}`}
                        aria-pressed={filter === "done"}
                        onClick={() => setFilter("done")}
                    >
                        Traitées ({doneCount})
                    </button>
                </div>

                {error && <p className="my-requests__error">{error}</p>}

                {visibleRequests.length === 0 ? (
                    <p className="my-requests__state">Aucune demande à afficher.</p>
                ) : (
                    <div className="my-requests__list">
                        {visibleRequests.map((request) => (
                            <article key={request.id} className="my-request-card">
                                <div className="my-request-card__header">
                                    <p className="my-request-card__name">{request.animal.name}</p>
                                    <RequestStatusBadge status={request.status} />
                                </div>
                                <p className="my-request-card__date">
                                    Demande envoyée le {new Date(request.requestedAt).toLocaleDateString("fr-FR")}
                                </p>

                                {request.status === "pending" && (
                                    <button
                                        type="button"
                                        className="my-request-card__cancel"
                                        onClick={() => handleCancel(request.id)}
                                    >
                                        Annuler la demande
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}