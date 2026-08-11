import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Shield, VenusAndMars } from "lucide-react";
import type { AnimalDetail as AnimalDetailData } from "../../types/Animal";
import { getAnimalBySlug } from "../../services/animalService";
import { createFosterRequest } from "../../services/fosterRequestService";
import { useAuth } from "../../context/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import './AnimalDetail.css';

export function AnimalDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { user, isAuthenticated } = useAuth();
    const [animal, setAnimal] = useState<AnimalDetailData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [requestSent, setRequestSent] = useState(false);
    const navigate = useNavigate();
    useDocumentTitle(animal ? animal.name : "Animal");

    useEffect(() => {
        if (!slug) return;
        getAnimalBySlug(slug)
        .then(setAnimal)
        .catch(() => setAnimal(null))
        .finally(() => setIsLoading(false));
    }, [slug]);

    async function handleSendRequest() {
        if (!animal) return;
        setIsSubmitting(true);
        setRequestError(null);
        try {
            await createFosterRequest({ animalId: animal.id, message: message || undefined });
            setRequestSent(true);
            setIsRequestFormOpen(false);
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return <p>Chargement...</p>;
    if (!animal) return <p>Cet animal n'existe pas ou n'est plus disponible.</p>;

    const cta = animal.status !== "available" ? (
        <p className="btn btn--disabled">
            {animal.status === "in_foster_care" ? "Déjà en famille d'accueil" : "Accueil terminé"}
        </p>
    ) : requestSent ? (
        <p className="btn btn--disabled">Demande envoyée !</p>
    ) : isRequestFormOpen ? (
        <div className="foster-request">
            <label htmlFor="foster-request-message" className="sr-only">
                Message pour l'association (facultatif)
            </label>
            <textarea
                id="foster-request-message"
                className="foster-request__message"
                placeholder="Un message pour l'association (facultatif)..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
            />
            {requestError && <p className="foster-request__error" role="alert">{requestError}</p>}
            <button type="button" className="btn" onClick={handleSendRequest} disabled={isSubmitting}>
                {isSubmitting ? "Envoi..." : "Confirmer la demande"}
            </button>
        </div>
    ) : !isAuthenticated ? (
        <button type="button" className="btn" onClick={() => navigate("/connexion")}>
            Connectez-vous pour offrir un foyer
        </button>
    ) : user?.role === "foster" ? (
        <button type="button" className="btn" onClick={() => setIsRequestFormOpen(true)}>
            Offrir un foyer
        </button>
    ) : null;

    return (
        <div className="animal-detail-page">
        <div className="animal-detail-main">
        <section className="animal-hero">
            {animal.imageUrl ? (
            <img className="animal-card__image" src={animal.imageUrl} alt={`Photo de ${animal.name}`} />
            ) : (
            <div className="animal-card__image animal-card__image--placeholder" />
            )}
        </section>

        <section className="animal-detail">
            <div>
            <h1>{animal.name}</h1>
            <h2>{animal.breed ?? animal.species.name}</h2>
            </div>

            <div className="card-detail">
            <div className="birth-date">
                <Calendar size={16} strokeWidth={1.8} />
                <p>Âge</p>
                <p>{animal.age !== null ? `${animal.age} an${animal.age > 1 ? "s" : ""}` : "Non renseigné"}</p>
            </div>
            <div className="gender">
                <VenusAndMars size={16} strokeWidth={1.8} />
                <p>Sexe</p>
                <p>{animal.gender === "male" ? "Mâle" : "Femelle"}</p>
            </div>
            <div className="state">
                <Shield size={16} strokeWidth={1.8} />
                <p>Castré</p>
                <p>{animal.neutered ? "Oui" : "Non"}</p>
            </div>
            </div>

            <div className="description">
            <h3>À propos</h3>
            <p>{animal.behavior ?? "Aucune information sur le comportement pour le moment."}</p>
            {animal.specificNeeds && <p>{animal.specificNeeds}</p>}
            </div>

            {animal.incompatibleSpecies.length > 0 && (
                <div className="incompatible">
                    <h3>Incompatible avec</h3>
                    <div className="incompatible-tags">
                        {animal.incompatibleSpecies.map(({ species }) => (
                            <span key={species.id} className="incompatible-tag">{species.name}</span>
                        ))}
                    </div>
                </div>
            )}
        </section>
        </div>

        <aside className="animal-detail-sidebar">
            {cta && <section className="animal-detail-cta">{cta}</section>}

            <section className="association-detail">
                {animal.association.imageUrl ? (
                    <img className="association-detail__avatar" src={animal.association.imageUrl} alt="" />
                ) : (
                    <div className="association-detail__avatar association-detail__avatar--placeholder" />
                )}
                <h2>{animal.association.name}</h2>
                <p>{animal.association.city}</p>
                <button
                    type="button"
                    className="association-btn"
                    onClick={() => navigate(`/associations/${animal.association.slug}`)}
                >
                    En savoir plus
                </button>
            </section>
        </aside>
        </div>
    );
}