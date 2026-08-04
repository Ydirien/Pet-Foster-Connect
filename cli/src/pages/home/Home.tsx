import heroImage from "../../assets/home/hero.jpg";
import card1Image from "../../assets/home/card_1.jpg";
import card2Image from "../../assets/home/card_2.jpg";
import card3Image from "../../assets/home/card_3.jpg";
import "./Home.css";

const STATS = [
    "publiez ou trouvez un animal a accueillir en quelques minutes",
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
    return <div>Home</div>;
}