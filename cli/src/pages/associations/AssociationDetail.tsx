import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Home, Mail, MapPin, Phone } from "lucide-react";
import { getAssociationBySlug } from "../../services/associationService";
import type { AssociationDetail as AssociationDetailData } from "../../types/Association";
import { AnimalCard } from "../../components/common/AnimalCard/AnimalCard";
import "./AssociationDetail.css";

export function AssociationDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [association, setAssociation] = useState<AssociationDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        getAssociationBySlug(slug)
            .then(setAssociation)
            .catch(() => setAssociation(null))
            .finally(() => setIsLoading(false));
    }, [slug]);

    if (isLoading) return <p className="association-detail-page__state">Chargement...</p>;
    if (!association) {
        return <p className="association-detail-page__state">Cette association n'existe pas ou plus.</p>;
    }

    return (
        <div className="association-detail-page">
            <section className="association-header">
                {association.imageUrl ? (
                    <img className="association-header__avatar" src={association.imageUrl} alt="" />
                ) : (
                    <div className="association-header__avatar association-header__avatar--placeholder">
                        <Home size={28} strokeWidth={1.6} />
                    </div>
                )}

                <div className="association-header__content">
                    <h1 className="association-header__name">{association.name}</h1>
                    <p className="association-header__city">
                        <MapPin size={16} strokeWidth={1.8} />
                        {association.address ? `${association.address}, ` : ""}
                        {association.city}
                    </p>

                    <div className="association-header__contact">
                        <a href={`mailto:${association.user.email}`} className="association-header__contact-link">
                            <Mail size={15} strokeWidth={1.8} />
                            {association.user.email}
                        </a>
                        {association.user.phone && (
                            <a href={`tel:${association.user.phone}`} className="association-header__contact-link">
                                <Phone size={15} strokeWidth={1.8} />
                                {association.user.phone}
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {association.description && (
                <section className="association-section">
                    <h2 className="association-section__title">À propos</h2>
                    <p className="association-section__text">{association.description}</p>
                </section>
            )}

            {association.openingHours && (
                <section className="association-section">
                    <h2 className="association-section__title">Horaires d'ouverture</h2>
                    <p className="association-section__text association-section__text--pre">
                        {association.openingHours}
                    </p>
                </section>
            )}

            <section className="association-section">
                <h2 className="association-section__title">
                    Animaux à accueillir ({association.animals.length})
                </h2>

                {association.animals.length === 0 ? (
                    <p className="association-section__text">
                        Aucun animal disponible pour le moment.
                    </p>
                ) : (
                    <div className="association-animals-grid">
                        {association.animals.map((animal) => (
                            <AnimalCard key={animal.id} animal={animal} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}