import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, MapPin } from "lucide-react";
import { listAssociations } from "../../services/associationService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Association } from "../../types/Association";
import { CityRadiusFilter, type CityRadiusValue } from "../../components/common/CityRadiusFilter/CityRadiusFilter";
import "./Associations.css";

const DEFAULT_RADIUS_KM = 25;

export function Associations() {
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cityRadius, setCityRadius] = useState<CityRadiusValue>({
        city: null,
        radiusKm: DEFAULT_RADIUS_KM,
    });
    useDocumentTitle("Les associations partenaires");

    useEffect(() => {
        setIsLoading(true);
        listAssociations(
            cityRadius.city
                ? { lat: cityRadius.city.latitude, lng: cityRadius.city.longitude, radiusKm: cityRadius.radiusKm }
                : {},
        )
            .then(setAssociations)
            .catch(() => setAssociations([]))
            .finally(() => setIsLoading(false));
    }, [cityRadius]);

    return (
        <section className="associations-list">
            <div className="associations-list__inner">
                <h1 className="associations-list__title">Les associations partenaires</h1>
                <p className="associations-list__subtitle">
                    Découvrez les associations qui publient des animaux à accueillir.
                </p>

                <div className="associations-list__filters">
                    <CityRadiusFilter value={cityRadius} onChange={setCityRadius} idPrefix="associations-filter" />
                </div>

                {isLoading ? (
                    <p className="associations-list__state">Chargement...</p>
                ) : associations.length === 0 ? (
                    <p className="associations-list__state">
                        {cityRadius.city
                            ? "Aucune association ne correspond à cette recherche."
                            : "Aucune association pour le moment."}
                    </p>
                ) : (
                    <div className="associations-list__grid">
                        {associations.map((association) => (
                            <Link
                                key={association.userId}
                                to={`/associations/${association.slug}`}
                                className="association-card"
                            >
                                {association.imageUrl ? (
                                    <img className="association-card__icon association-card__icon--photo" src={association.imageUrl} alt="" loading="lazy" />
                                ) : (
                                    <div className="association-card__icon">
                                        <Home size={20} strokeWidth={1.8} />
                                    </div>
                                )}
                                <h2 className="association-card__name">{association.name}</h2>
                                <p className="association-card__city">
                                    <MapPin size={14} strokeWidth={1.8} />
                                    {association.city}
                                </p>
                                {association.description && (
                                    <p className="association-card__description">{association.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}