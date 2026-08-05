import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import type { CurrentFosterUser } from "../../types/Auth";
import type { FosterRequest } from "../../types/FosterRequest";
import { listFosterRequests } from "../../services/fosterRequestService";
import { RequestStatusBadge } from "../../components/common/RequestStatusBadge/RequestStatusBadge";
import { AccountActions } from "./AccountActions";
import "./Account.css";

interface FosterAccountViewProps {
    account: CurrentFosterUser;
}

export function FosterAccountView({ account }: FosterAccountViewProps) {
    const [requests, setRequests] = useState<FosterRequest[]>([]);

    useEffect(() => {
        listFosterRequests()
            .then(setRequests)
            .catch(() => setRequests([]));
    }, []);

    const memberSince = new Date(account.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });

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
                    <span className="account__badge">Famille d'accueil</span>
                    <h1 className="account__name">
                        {account.profile.firstName} {account.profile.lastName}
                    </h1>
                    <p className="account__since">Membre depuis {memberSince}</p>
                </div>
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
                    <h2 className="account__card-title">Mes demandes d'accueil</h2>
                    <Link to="/demandes" className="account__edit-link">Voir tout</Link>
                </div>

                {preview.length === 0 ? (
                    <p className="account__info-value">Aucune demande envoyée pour le moment.</p>
                ) : (
                    <div className="account__requests">
                        {preview.map((request) => (
                            <div key={request.id} className="account__request">
                                <div className="account__request-header">
                                    <p className="account__request-name">{request.animal.name}</p>
                                    <RequestStatusBadge status={request.status} />
                                </div>
                                <p className="account__request-date">
                                    Demande envoyée le {new Date(request.requestedAt).toLocaleDateString("fr-FR")}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AccountActions />
          </div>
        </section>
    );
}