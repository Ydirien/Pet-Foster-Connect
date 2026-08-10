import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import "./LegalNotice.css";

export function LegalNotice() {
    useDocumentTitle("Mentions légales");

    return (
        <section className="legal-notice">
            <h1 className="legal-notice__title">Mentions légales</h1>

            <div className="legal-notice__block">
                <h2>Éditeur du site</h2>
                <p>
                    Pet Foster Connect<br />
                    Gaëtan Plassard<br />
                    Contact : gaetan.plassard@hotmail.fr
                </p>
            </div>

            <div className="legal-notice__block">
                <h2>Hébergement</h2>
                <p>Aucun hébergeur</p>
            </div>

            <div className="legal-notice__block">
                <h2>Propriété intellectuelle</h2>
                <p>
                    L'ensemble des contenus présents sur ce site (textes, images, logo) sont la
                    propriété de Pet Foster Connect, sauf mention contraire.
                </p>
            </div>

            <div className="legal-notice__block">
                <h2>Données personnelles</h2>
                <p>
                    Les informations recueillies via ce site sont utilisées exclusivement pour la
                    mise en relation entre familles d'accueil et associations. Conformément au RGPD,
                    vous disposez d'un droit d'accès, de rectification et de suppression de vos
                    données en nous contactant.
                </p>
            </div>
        </section>
    );
}