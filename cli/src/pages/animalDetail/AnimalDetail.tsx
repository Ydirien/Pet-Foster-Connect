import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, Home, Image as ImageIcon, Shield, VenusAndMars } from "lucide-react";
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
            <section className="animal-detail__photo">
                {animal.imageUrl ? (
                    <img className="animal-detail__photo-img" src={animal.imageUrl} alt={`Photo de ${animal.name}`} />
                ) : (
                    <div className="animal-detail__photo-placeholder">
                        <ImageIcon size={28} strokeWidth={1.5} />
                        <p>Photo de {animal.name}</p>
                    </div>
                )}
            </section>

            <div className="animal-detail__title">
                <h1>{animal.name}</h1>
                <h2>{animal.breed ?? animal.species.name}</h2>
            </div>

            <div className="animal-detail__stats">
                <div className="animal-detail__stat">
                    <Calendar size={16} strokeWidth={1.8} />
                    <p className="animal-detail__stat-label">Âge</p>
                    <p className="animal-detail__stat-value">
                        {animal.age !== null ? `${animal.age} an${animal.age > 1 ? "s" : ""}` : "Non renseigné"}
                    </p>
                </div>
                <div className="animal-detail__stat">
                    <VenusAndMars size={16} strokeWidth={1.8} />
                    <p className="animal-detail__stat-label">Sexe</p>
                    <p className="animal-detail__stat-value">{animal.gender === "male" ? "Mâle" : "Femelle"}</p>
                </div>
                <div className="animal-detail__stat">
                    <Shield size={16} strokeWidth={1.8} />
                    <p className="animal-detail__stat-label">Castré</p>
                    <p className="animal-detail__stat-value">{animal.neutered ? "Oui" : "Non"}</p>
                </div>
            </div>

            <div className="animal-detail__about">
                <h3>À propos</h3>
                <p>{animal.behavior ?? "Aucune information sur le comportement pour le moment."}</p>
                {animal.specificNeeds && <p>{animal.specificNeeds}</p>}
            </div>

            {animal.incompatibleSpecies.length > 0 && (
                <div className="animal-detail__incompatible">
                    <h3>Incompatible avec</h3>
                    <div className="animal-detail__incompatible-tags">
                        {animal.incompatibleSpecies.map(({ species }) => (
                            <span key={species.id} className="animal-detail__incompatible-tag">{species.name}</span>
                        ))}
                    </div>
                </div>
            )}

            <section className="animal-detail__association">
                {animal.association.imageUrl ? (
                    <img className="animal-detail__association-avatar" src={animal.association.imageUrl} alt="" />
                ) : (
                    <div className="animal-detail__association-avatar animal-detail__association-avatar--placeholder">
                        <Home size={22} strokeWidth={1.6} />
                    </div>
                )}
                <div className="animal-detail__association-info">
                    <p className="animal-detail__association-label">Association responsable</p>
                    <h2 className="animal-detail__association-name">{animal.association.name}</h2>
                    <p className="animal-detail__association-city">{animal.association.city}</p>
                </div>
                <button
                    type="button"
                    className="animal-detail__association-btn"
                    onClick={() => navigate(`/associations/${animal.association.slug}`)}
                >
                    Voir le profil
                </button>
            </section>

            {cta && <section className="animal-detail__cta">{cta}</section>}
        </div>
    );
}
