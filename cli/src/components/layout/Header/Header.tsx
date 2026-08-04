import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import logo from "../../../assets/logos/Logo-3-EnergieAccueil.png";
import { useAuth } from "../../../context/AuthContext";
import "./Header.css";

const NAV_LINKS = [
    { to: "/", label: "Accueil" },
    { to: "/animaux", label: "Animaux à accueillir" },
    { to: "/associations", label: "Liste des associations" },
];

// Pas de lien "Mon compte"/"Connexion" ici : l'icône profil du header y mène déjà.

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    function goToAccount() {
        navigate(isAuthenticated ? "/compte" : "/connexion");
    }

    return (
        <header className="header">
            <button
                type="button"
                className="header__burger"
                aria-label="Ouvrir le menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
            >
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
            </button>
            <Link to="/" className="header__logo-link" aria-label="Retour à l'accueil">
                <img className="header__logo" src={logo} alt="Pet Foster Connect" />
            </Link>
            <button type="button" className="header__profile" aria-label="Mon compte" onClick={goToAccount}>
                <User size={30} strokeWidth={1.8} />
            </button>

            <nav className={`header__nav${isMenuOpen ? " header__nav--open" : ""}`}>
                {NAV_LINKS.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="header__nav-link"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </header>
    );
}