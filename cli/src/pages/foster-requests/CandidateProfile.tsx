import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Home, Trees, Footprints, User, Mail, Phone } from "lucide-react";
import { getFosterRequestById } from "../../services/fosterRequestService";
import { getFosterProfileForAssociation } from "../../services/userService";
import { useFosterRequestDecision } from "../../hooks/useFosterRequestDecision";
import type { FosterRequest, FosterRequestStatus } from "../../types/FosterRequest";
import type { FosterProfileForAssociation } from "../../types/Foster";
import "./CandidateProfile.css";

const HOUSING_LABELS: Record<string, string> = {
    house: "Maison",
    apartment: "Appartement",
};

const EXPERIENCE_LABELS: Record<string, string> = {
    beginner: "Débutant(e)",
    confirmed: "Confirmée",
    experienced: "Expérimenté(e)",
};

const WALK_TIME_LABELS: Record<string, string> = {
    less_than_30min: "Moins de 30 minutes",
    between_30min_1h: "Entre 30 minutes et 1h",
    between_1h_2h: "Entre 1h et 2h",
    more_than_2h: "Plus de 2h",
};

const HOME_PRESENCE_LABELS: Record<string, string> = {
    full_time: "Présence toute la journée",
    part_time: "Présence une partie de la journée",
    evenings_only: "Présence le soir et le week-end uniquement",
    variable: "Horaires irréguliers",
};

const REQUEST_STATUS_LABELS: Record<FosterRequestStatus, string> = {
    pending: "En attente",
    accepted: "Demande acceptée",
    rejected: "Demande refusée",
    cancelled: "Demande annulée",
};

export function CandidateProfile() {
    const { requestId } = useParams<{ requestId: string }>();
    const [request, setRequest] = useState<FosterRequest | null>(null);
    const [candidate, setCandidate] = useState<FosterProfileForAssociation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { decide, isUpdating, error: decisionError } = useFosterRequestDecision();
    const error = loadError ?? decisionError;

    useEffect(() => {
        if (!requestId) {
            setLoadError("Demande introuvable.");
            setIsLoading(false);
            return;
        }

        getFosterRequestById(Number(requestId))
            .then(async (fetchedRequest) => {
                setRequest(fetchedRequest);
                setCandidate(await getFosterProfileForAssociation(fetchedRequest.fosterId));
            })
            .catch((err) => setLoadError(err instanceof Error ? err.message : "Une erreur est survenue."))
            .finally(() => setIsLoading(false));
    }, [requestId]);

    async function handleDecision(status: "accepted" | "rejected") {
        if (!request) return;
        const updated = await decide(request.id, status);
        if (updated) setRequest(updated);
    }

    if (isLoading) return <p className="candidate-profile__state">Chargement...</p>;
    if (!candidate || !request) {
        return <p className="candidate-profile__state">{error ?? "Profil introuvable."}</p>;
    }

    const memberSince = new Date(candidate.user.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

    const housingLabel = candidate.housingType ? HOUSING_LABELS[candidate.housingType] : "Non renseigné";
    const housingValue =
        candidate.housingSize !== null ? `${housingLabel} - ${candidate.housingSize}m2` : housingLabel;

    const gardenValue = candidate.hasGarden
        ? candidate.gardenSize !== null
            ? `${candidate.gardenSize}m2`
            : "Oui"
        : "Aucun jardin";

    return (
        <section className="candidate-profile">
            <div className="candidate-profile__header">
                {candidate.imageUrl ? (
                    <img className="candidate-profile__avatar" src={candidate.imageUrl} alt="" />
                ) : (
                    <div className="candidate-profile__avatar candidate-profile__avatar--placeholder" />
                )}
                <div>
                    <span className="candidate-profile__badge">Famille d'accueil</span>
                    <h1 className="candidate-profile__name">
                        {candidate.firstName} {candidate.lastName}
                    </h1>
                    <p className="candidate-profile__since">Membre depuis {memberSince}</p>
                </div>
            </div>

            <div className="candidate-profile__card">
                <h2 className="candidate-profile__card-title">Contact</h2>

                <div className="candidate-profile__info">
                    <Mail size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Email</p>
                        <p className="candidate-profile__info-value">{candidate.user.email}</p>
                    </div>
                </div>

                <div className="candidate-profile__info">
                    <Phone size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Téléphone</p>
                        <p className="candidate-profile__info-value">{candidate.user.phone ?? "Non renseigné"}</p>
                    </div>
                </div>
            </div>

            <div className="candidate-profile__card">
                <h2 className="candidate-profile__card-title">Logement</h2>

                <div className="candidate-profile__info">
                    <Home size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Type</p>
                        <p className="candidate-profile__info-value">{housingValue}</p>
                    </div>
                </div>

                <div className="candidate-profile__info">
                    <Trees size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Jardin</p>
                        <p className="candidate-profile__info-value">{gardenValue}</p>
                    </div>
                </div>
            </div>

            <div className="candidate-profile__card">
                <h2 className="candidate-profile__card-title">Disponibilité</h2>

                <div className="candidate-profile__info">
                    <Footprints size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Temps promenade /jour</p>
                        <p className="candidate-profile__info-value">
                            {candidate.walkTime ? WALK_TIME_LABELS[candidate.walkTime] : "Non renseigné"}
                        </p>
                    </div>
                </div>

                <div className="candidate-profile__info">
                    <User size={18} strokeWidth={1.8} />
                    <div>
                        <p className="candidate-profile__info-label">Présence au domicile</p>
                        <p className="candidate-profile__info-value">
                            {candidate.homePresence ? HOME_PRESENCE_LABELS[candidate.homePresence] : "Non renseigné"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="candidate-profile__card">
                <div className="candidate-profile__card-header">
                    <h2 className="candidate-profile__card-title">Expériences</h2>
                    {candidate.experienceLevel && (
                        <span className="candidate-profile__experience-badge">
                            {EXPERIENCE_LABELS[candidate.experienceLevel]}
                        </span>
                    )}
                </div>
                <p className="candidate-profile__experience-text">
                    {candidate.experienceDescription ?? "Aucune description fournie."}
                </p>
            </div>

            <div className="candidate-profile__card">
                <h2 className="candidate-profile__card-title">Animaux déjà présents</h2>
                {candidate.householdPets.length === 0 ? (
                    <p className="candidate-profile__info-value">Aucun animal au foyer actuellement.</p>
                ) : (
                    <div className="candidate-profile__pets">
                        {candidate.householdPets.map((pet) => (
                            <span key={pet.id} className="candidate-profile__pet-tag">
                                {pet.species.name}
                                {pet.age !== null ? `, ${pet.age} ans` : ""}
                                {pet.neutered ? ", castré" : ""}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="candidate-profile__card">
                <h2 className="candidate-profile__card-title">Budget mensuel estimé</h2>
                <p className="candidate-profile__budget">
                    {candidate.monthlyBudget !== null
                        ? `${Math.round(Number(candidate.monthlyBudget))} €`
                        : "Non renseigné"}
                </p>
                <p className="candidate-profile__budget-caption">Nourriture, vétérinaire et accessoires</p>
            </div>

            {error && <p className="candidate-profile__error">{error}</p>}

            {request.status === "pending" ? (
                <div className="candidate-profile__actions">
                    <button
                        type="button"
                        className="candidate-profile__action candidate-profile__action--reject"
                        onClick={() => handleDecision("rejected")}
                        disabled={isUpdating}
                    >
                        Refuser
                    </button>
                    <button
                        type="button"
                        className="candidate-profile__action candidate-profile__action--accept"
                        onClick={() => handleDecision("accepted")}
                        disabled={isUpdating}
                    >
                        Accepter
                    </button>
                </div>
            ) : (
                <p className="candidate-profile__decided">{REQUEST_STATUS_LABELS[request.status]}</p>
            )}
        </section>
    );
}