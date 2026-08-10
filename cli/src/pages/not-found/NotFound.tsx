import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./NotFound.css";

export function NotFound() {
    useDocumentTitle("Page introuvable");

    return (
        <section className="not-found">
            <p className="not-found__code">404</p>
            <h1 className="not-found__title">Page introuvable</h1>
            <p className="not-found__text">
                La page que vous cherchez n'existe pas ou a été déplacée.
            </p>
            <Link to="/" className="not-found__link">Retour à l'accueil</Link>
        </section>
    );
}