import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import type { CurrentAssociationUser } from "../../types/Auth";
import type { Animal, AnimalStatus } from "../../types/Animal";
import type { FosterRequest } from "../../types/FosterRequest";
import { listFosterRequests } from "../../services/fosterRequestService";
import { listAnimals } from "../../services/animalService";
import { RequestStatusBadge } from "../../components/common/RequestStatusBadge/RequestStatusBadge";
import { AccountActions } from "./AccountActions";
import "./Account.css";

interface AssociationAccountViewProps {
    account: CurrentAssociationUser;
}

const ANIMAL_STATUS_LABELS: Record<AnimalStatus, string> = {
    available: "Disponible",
    in_foster_care: "En famille d'accueil",
    completed: "Accueil terminé",
};

export function AssociationAccountView({ account }: AssociationAccountViewProps) {
    const [requests, setRequests] = useState<FosterRequest[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);

    useEffect(() => {
        listFosterRequests()
            .then(setRequests)
            .catch(() => setRequests([]));

        listAnimals({ associationId: account.profile.userId })
            .then(setAnimals)
            .catch(() => setAnimals([]));
    }, [account.profile.userId]);

    const animalCounts = {
        total: animals.length,
        inFosterCare: animals.filter((animal) => animal.status === "in_foster_care").length,
    };

    const memberSince = new Date(account.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

    const pendingCount = requests.filter((request) => request.status === "pending").length;
    const preview = [...requests]
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
        .slice(0, 3);

    return (
        <section className="account">
          <div className="account__inner">
            <div className="account__header">
                {account.profile.imageUrl ? (
                    <img className="account__avatar" src={account.profile.imageUrl} alt="" />
                ) : (
                    <div className="account__avatar account__avatar--placeholder" />
                )}
                <div>
                    <h1 className="account__name">{account.profile.name}</h1>
                    <p className="account__since">Membre depuis {memberSince}</p>
                </div>
            </div>

            <div className="account__card">
                <h2 className="account__card-title">Aperçu</h2>
                <div className="account__stats">
                    <div className="account__stat">
                        <p className="account__stat-value">{animalCounts.total}</p>
                        <p className="account__stat-label">Publiés</p>
                    </div>
                    <div className="account__stat">
                        <p className="account__stat-value">{pendingCount}</p>
                        <p className="account__stat-label">En attente</p>
                    </div>
                    <div className="account__stat">
                        <p className="account__stat-value">{animalCounts.inFosterCare}</p>
                        <p className="account__stat-label">Accueillis</p>
                    </div>
                </div>
            </div>

            <div className="account__card">
                <div className="account__card-header">
                    <h2 className="account__card-title">Mes animaux publiés</h2>
                </div>

                {animals.length === 0 ? (
                    <p className="account__info-value">Aucun animal publié pour le moment.</p>
                ) : (
                    <div className="account__animals">
                        {animals.map((animal) => (
                            <div key={animal.id} className="account__animal">
                                <div>
                                    <p className="account__request-name">{animal.name}</p>
                                    <p className="account__request-date">{ANIMAL_STATUS_LABELS[animal.status]}</p>
                                </div>
                                <Link to={`/animaux/${animal.slug}/modifier`} className="account__edit-link">
                                    Modifier
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="account__card">
                <div className="account__card-header">
                    <h2 className="account__card-title">Demandes d'accueil</h2>
                    <Link to="/demandes" className="account__edit-link">Voir tout</Link>
                </div>

                {preview.length === 0 ? (
                    <p className="account__info-value">Aucune demande reçue pour le moment.</p>
                ) : (
                    <div className="account__requests">
                        {preview.map((request) => (
                            <div key={request.id} className="account__request">
                                <div className="account__request-header">
                                    <p className="account__request-name">{request.foster?.firstName}</p>
                                    <RequestStatusBadge status={request.status} />
                                </div>
                                <p className="account__request-date">
                                    Souhaite accueillir <strong>{request.animal.name}</strong>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="account__card">
                <div className="account__card-header">
                    <h2 className="account__card-title">Informations</h2>
                    <Link to="/compte/modifier" className="account__edit-link">Modifier</Link>
                </div>

                <div className="account__info">
                    <Mail size={18} strokeWidth={1.8} />
                    <div>
                        <p className="account__info-label">Email</p>
                        <p className="account__info-value">{account.email}</p>
                    </div>
                </div>

                <div className="account__info">
                    <Phone size={18} strokeWidth={1.8} />
                    <div>
                        <p className="account__info-label">Téléphone</p>
                        <p className="account__info-value">{account.phone ?? "Non renseigné"}</p>
                    </div>
                </div>

                <div className="account__info">
                    <MapPin size={18} strokeWidth={1.8} />
                    <div>
                        <p className="account__info-label">Ville</p>
                        <p className="account__info-value">
                            {account.profile.city}
                            {account.profile.postalCode ? ` (${account.profile.postalCode})` : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="account__card">
                <div className="account__card-header">
                    <h2 className="account__card-title">Description</h2>
                    <Link to="/compte/modifier" className="account__edit-link">Modifier</Link>
                </div>
                <p className="account__description">
                    {account.profile.description ?? "Aucune description renseignée."}
                </p>
            </div>

            <Link to="/publier-un-animal" className="account__publish-btn">Publier un animal</Link>

            <AccountActions />
          </div>
        </section>
    );
}