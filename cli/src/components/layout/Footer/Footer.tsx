import { Link } from "react-router-dom";
import "./Footer.css";

export function Footer() {
    return (
        <footer className="footer">
            <nav className="footer__links">
                <Link to="/mentions-legales" className="footer__link">Mentions légales</Link>
                <Link to="/politique-de-confidentialite" className="footer__link">Politique de confidentialité</Link>
            </nav>
            <p className="footer__copyright">
                © {new Date().getFullYear()} Pet Foster Connect. Tous droits réservés.
            </p>
        </footer>
    );
}