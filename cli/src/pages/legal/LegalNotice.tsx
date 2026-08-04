import "./LegalNotice.css";

export function LegalNotice() {
    return (
        <section className="legal-notice">
            <h1 className="legal-notice__title">Mentions légales</h1>

            <div className="legal-notice__block">
                <h2>Éditeur du site</h2>
                <p>
                    Pet Foster Connect<br />
                    [Ton nom / statut, ex : projet réalisé dans le cadre d'une formation]<br />
                    Contact : [ton email]
                </p>
            </div>

            <div className="legal-notice__block">
                <h2>Hébergement</h2>
                <p>[Nom de l'hébergeur, ex : Render, Railway, etc.]</p>
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