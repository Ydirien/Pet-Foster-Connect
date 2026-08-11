# Arborescence de l'application

L'arborescence de Pet Foster Connect correspond aux différentes pages accessibles depuis le frontend.

```text
/
├── animaux
│   ├── /animaux
│   └── /animaux/:slug
│       └── /animaux/:slug/modifier
│
├── associations
│   ├── /associations
│   └── /associations/:slug
│
├── authentification
│   ├── /connexion
│   ├── /inscription
│   ├── /mot-de-passe-oublie
│   └── /reinitialiser-mot-de-passe
│
├── compte
│   ├── /compte
│   └── /compte/modifier
│
├── demandes
│   ├── /demandes
│   └── /candidats/:requestId
│
├── /publier-un-animal
│
├── informations légales
│   ├── /mentions-legales
│   └── /politique-de-confidentialite
│
└── * → page 404
```

## Pages publiques

Les pages suivantes sont accessibles sans être connecté :

- `/` : page d'accueil ;
- `/animaux` : liste des animaux ;
- `/animaux/:slug` : détail d'un animal ;
- `/associations` : liste des associations ;
- `/associations/:slug` : détail d'une association ;
- `/connexion` : connexion ;
- `/inscription` : inscription ;
- `/mot-de-passe-oublie` : demande de réinitialisation du mot de passe ;
- `/reinitialiser-mot-de-passe` : choix d'un nouveau mot de passe ;
- `/mentions-legales` : mentions légales ;
- `/politique-de-confidentialite` : politique de confidentialité.

## Pages accessibles après connexion

- `/compte` : consulter son compte ;
- `/compte/modifier` : modifier son profil ;
- `/demandes` : consulter ses demandes d'accueil ou les demandes reçues selon le type de compte.

## Pages réservées aux associations

- `/publier-un-animal` : publier un nouvel animal ;
- `/animaux/:slug/modifier` : modifier une fiche animal ;
- `/candidats/:requestId` : consulter le profil d'une famille ayant envoyé une demande.

## Exemple de parcours utilisateur

### Famille d'accueil

```text
Accueil
→ Liste des animaux
→ Détail d'un animal
→ Connexion / inscription
→ Envoi d'une demande
→ Mes demandes
```

### Association

```text
Connexion
→ Compte
→ Publier un animal
→ Demandes reçues
→ Profil du candidat
→ Acceptation ou refus de la demande
```

Les routes nécessitant une connexion sont protégées côté frontend. Certaines routes vérifient également que l'utilisateur possède un compte de type `association`.
