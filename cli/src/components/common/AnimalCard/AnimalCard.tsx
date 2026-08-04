import { Link } from "react-router-dom";
import { Calendar, ShieldCheck } from "lucide-react";
import type { Animal } from "../../../types/Animal";
import "./AnimalCard.css";

interface AnimalCardProps {
    animal: Animal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
    return (
        <Link to={`/animaux/${animal.slug}`} className="animal-card">
            <div className="animal-card__image-wrapper">
                {animal.imageUrl ? (
                    <img className="animal-card__image" src={animal.imageUrl} alt="" />
                ) : (
                    <div className="animal-card__image animal-card__image--placeholder" />
                )}
            </div>

            <h3 className="animal-card__name">{animal.name}</h3>

            <div className="animal-card__stats">
                <div className="animal-card__stat">
                    <Calendar size={18} strokeWidth={1.8} />
                    <span className="animal-card__stat-label">Âge</span>
                    <span className="animal-card__stat-value">
                        {animal.age !== null ? `${animal.age} an${animal.age > 1 ? "s" : ""}` : "Inconnu"}
                    </span>
                </div>

                <div className="animal-card__stat">
                    <span className="animal-card__gender-icon">
                        {animal.gender === "male" ? "♂" : "♀"}
                    </span>
                    <span className="animal-card__stat-label">Sexe</span>
                    <span className="animal-card__stat-value">
                        {animal.gender === "male" ? "Mâle" : "Femelle"}
                    </span>
                </div>

                <div className="animal-card__stat">
                    <ShieldCheck size={18} strokeWidth={1.8} />
                    <span className="animal-card__stat-label">Castré</span>
                    <span className="animal-card__stat-value">
                        {animal.neutered ? "Oui" : "Non"}
                    </span>
                </div>
            </div>

            <p className="animal-card__association">{animal.association.name}</p>
        </Link>
    );
}