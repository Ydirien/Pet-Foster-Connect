# Accessibilité (RGAA) et protection des données (RGPD)

Ce document explique comment le RGAA et le RGPD ont été pris en compte dès la conception de Pet Foster Connect, et pas seulement ajoutés après coup.

## Accessibilité — RGAA

Le public visé (voir `7-cible-pet-foster-connect.md`) inclut des utilisateurs avec des niveaux différents en informatique. L'application doit donc rester utilisable au clavier, avec un lecteur d'écran, et lisible pour tout le monde.

### Choix retenus dès la conception

- Langue de la page déclarée (`lang="fr"` dans `cli/index.html`) pour que les lecteurs d'écran prononcent le contenu correctement.
- Lien d'évitement ("Aller au contenu principal") en tout début de page (`cli/src/App.tsx`), pour permettre de sauter la navigation au clavier.
- Utilisation de balises sémantiques HTML plutôt que des `<div>` génériques partout, pour que la structure de la page soit compréhensible par un lecteur d'écran.
- Formulaires avec des `<label>` associés à chaque champ (`htmlFor`), pour que chaque champ soit annoncé correctement.
- Attributs `aria-label` sur les boutons qui ne contiennent qu'une icône (ex : bouton menu, bouton profil dans `Header.tsx`), pour que leur fonction soit annoncée même sans texte visible.
- Attribut `aria-expanded` sur le bouton du menu mobile, pour indiquer son état ouvert/fermé.
- Texte alternatif (`alt`) sur les images porteuses de sens, comme le logo.
- Messages d'erreur des formulaires affichés en texte, et pas uniquement par une couleur, pour rester compréhensibles par une personne daltonienne ou un lecteur d'écran.
- Interface responsive (mobile, tablette, ordinateur), pour rester utilisable quel que soit l'appareil ou le niveau de zoom.

### Limites actuelles

Le projet applique ces bonnes pratiques au fil du développement, mais n'a pas encore fait l'objet d'un audit RGAA complet avec grille de contrôle officielle (106 critères). Un contrôle plus poussé pourrait être fait avec un outil comme axe-core ou le plugin ESLint `jsx-a11y`, non installé pour le moment.

## Protection des données — RGPD

### Minimisation des données

Le schéma de données (voir `13-dictionnaire-de-donnees-pet-foster-connect.md`) a été pensé pour ne demander que les informations nécessaires au fonctionnement de la mise en relation :

- l'email et le mot de passe sont les seules données obligatoires pour créer un compte ;
- les informations plus sensibles (logement, budget, expérience, animaux déjà présents au foyer) sont facultatives et ne servent qu'à aider l'association à évaluer une candidature ;
- aucune donnée bancaire n'est collectée, l'application ne gérant pas de paiement.

### Sécurité des données dès la conception

- Le mot de passe n'est jamais stocké en clair : il est haché avec Argon2 avant d'être enregistré (`password` dans `users`).
- L'authentification repose sur des jetons (access token + refresh token) avec expiration, plutôt que sur un identifiant de session permanent.
- Les entrées utilisateur sont validées avec Zod avant tout traitement, et nettoyées contre les scripts malveillants (protection XSS).
- Les accès aux données personnelles sont limités par des vérifications de rôle et de propriété : une famille d'accueil ne peut pas consulter le profil d'une autre famille, une association ne voit le profil d'un candidat que s'il a fait une demande sur un de ses animaux.

### Droits des utilisateurs

Ces droits sont prévus dès la conception du modèle de données, pas seulement décrits dans la politique de confidentialité :

- **Droit d'accès** : chaque utilisateur peut consulter son profil complet (`GET /api/users/me`).
- **Droit de rectification** : chaque utilisateur peut modifier son profil (`PUT /api/users/me`).
- **Droit à l'effacement** : chaque utilisateur peut supprimer son compte (`DELETE /api/users/me`). La suppression est prévue en cascade dans le schéma (`onDelete: Cascade`) sur les tables liées à un utilisateur (`fosters`, `associations`, `refresh_tokens`, `password_reset_tokens`), pour ne pas laisser de données orphelines.

### Conservation des données

Les données sont conservées tant que le compte existe. Les jetons de connexion et de réinitialisation de mot de passe ont une date d'expiration (`expiresAt`) pour limiter leur durée de vie.

### Information des utilisateurs

Les mentions légales et la politique de confidentialité sont accessibles depuis toutes les pages (`/mentions-legales`, `/politique-de-confidentialite`), pour que les utilisateurs sachent quelles données sont collectées et pourquoi avant de créer un compte.
