import "./PrivacyPolicy.css";

export function PrivacyPolicy() {
    return (
        <section className="privacy-policy">
            <h1 className="privacy-policy__title">Politique de confidentialité</h1>

            <div className="privacy-policy__block">
                <h2>Données collectées</h2>
                <p>
                    Lors de votre inscription, nous collectons votre email, mot de passe (chiffré),
                    et selon votre profil : nom, prénom et coordonnées pour une famille d'accueil,
                    ou nom, SIRET et coordonnées pour une association. D'autres informations
                    (logement, disponibilité, animaux du foyer) peuvent être renseignées
                    volontairement pour faciliter la mise en relation.
                </p>
            </div>

            <div className="privacy-policy__block">
                <h2>Finalité du traitement</h2>
                <p>
                    Ces données sont utilisées exclusivement pour permettre la mise en relation
                    entre familles d'accueil et associations, la gestion des demandes d'accueil, et
                    la sécurisation de votre compte (authentification).
                </p>
            </div>

            <div className="privacy-policy__block">
                <h2>Conservation des données</h2>
                <p>
                    Vos données sont conservées tant que votre compte est actif. Vous pouvez
                    demander la suppression de votre compte à tout moment depuis votre espace
                    personnel, ce qui entraîne la suppression de vos données associées.
                </p>
            </div>

            <div className="privacy-policy__block">
                <h2>Cookies et stockage local</h2>
                <p>
                    Le site utilise le stockage local de votre navigateur pour conserver votre
                    session de connexion. Aucun cookie publicitaire ou de suivi tiers n'est utilisé.
                </p>
            </div>

            <div className="privacy-policy__block">
                <h2>Vos droits</h2>
                <p>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous
                    disposez d'un droit d'accès, de rectification, de suppression et de portabilité
                    de vos données. Vous pouvez exercer ces droits en nous contactant à [ton email
                    de contact].
                </p>
            </div>

            <div className="privacy-policy__block">
                <h2>Partage des données</h2>
                <p>
                    Vos données ne sont jamais vendues ni partagées avec des tiers à des fins
                    commerciales. Seules les informations nécessaires à la mise en relation sont
                    visibles par l'autre partie (association ou famille d'accueil) une fois une
                    demande d'accueil créée.
                </p>
            </div>
        </section>
    );
}
