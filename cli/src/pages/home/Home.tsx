import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSpecies } from "../../services/animalService";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Species } from "../../types/Animal";
import heroImage from "../../assets/home/Hero.jpg";
import card1Image from "../../assets/home/card_1.jpg";
import card2Image from "../../assets/home/card_2.jpg";
import card3Image from "../../assets/home/card_3.jpg";
import "./Home.css";

const STATS = [
    "Publiez ou trouvez un animal à accueillir en quelques minutes",
    "Suivez vos demandes d'accueil du dépôt jusqu'à la réponse",
    "Échangez directement avec l'association, sans intermédiaire",
];

const STEPS = [
    {
        number: 1,
        title: "Cherchez votre futur compagnon",
        text: "À partir de la liste des animaux disponibles, trouvez l'animal qui vous correspond et entrez en contact avec l'association.",
        image: card1Image,
    },
    {
        number: 2,
        title: "Faites connaissance",
        text: "Échangez avec l'association pour organiser une rencontre et vérifier que le courant passe bien.",
        image: card2Image,
    },
    {
        number: 3,
        title: "Finalisez l'accueil",
        text: "Une fois la rencontre passée, finalisez avec l'association la mise en place de l'accueil temporaire.",
        image: card3Image,
    },
];

export function Home() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    useDocumentTitle("Accueil");

    useEffect(() => {
        getSpecies()
            .then(setSpecies)
            .catch(() => setSpecies([]))
            .finally(() => setIsLoading(false));
    }, []);

    function handleSearch() {
        navigate(selectedSpecies ? `/animaux?speciesId=${selectedSpecies}` : "/animaux");
    }

    return (
        <>
            <section className="hero">
                <img className="hero__image" src={heroImage} alt="Trois chiens dans un parc" />
                <div className="hero__content">
                    <h1>Aidez n'a jamais été si simple</h1>
                    <p>Une garde temporaire basée sur une relation de confiance</p>
                    <label htmlFor="species-search" className="sr-only">Quel animal cherchez-vous ?</label>
                    <select
                        id="species-search"
                        className="animal-select"
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">
                            {isLoading ? "Chargement..." : "Quel animal cherchez-vous ?"}
                        </option>
                        {species.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={handleSearch}>Sauvez un animal</button>
                </div>
            </section>

            <section className="info-bar">
                <div className="info-slider">
                    {/* La liste est dupliquée pour l'effet de défilement infini en CSS :
                        on masque la copie aux lecteurs d'écran pour éviter qu'ils
                        n'annoncent deux fois le même contenu. */}
                    <div className="info-slide__track">
                        {STATS.map((text, i) => (
                            <span key={`a-${i}`}>{text}</span>
                        ))}
                        {STATS.map((text, i) => (
                            <span key={`b-${i}`} aria-hidden="true">{text}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="tutorial-section">
                <p className="tutorial-section__kicker">Devenir famille d'accueil n'a jamais été aussi simple</p>
                <h2 className="tutorial-section__title">Comment accueillir un animal ?</h2>

                <div className="tutorial-carousel">
                    {STEPS.map((step) => (
                        <article className="tutorial-card" key={step.number}>
                            <div className="tutorial-card__image-wrapper">
                                <img className="tutorial-card__image" src={step.image} alt="" />
                                <span className="tutorial-card__number">{step.number}</span>
                            </div>
                            <h3 className="tutorial-card__title">{step.title}</h3>
                            <p className="tutorial-card__text">{step.text}</p>
                        </article>
                    ))}
                </div>

                <button type="button" className="tutorial-section__cta" onClick={handleSearch}>
                    C'est parti !
                </button>
            </section>
        </>
    );
}