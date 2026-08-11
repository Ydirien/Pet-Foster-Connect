# MCD — Pet Foster Connect

Ce MCD reprend les données réellement présentes dans le projet, sans les types SQL ni les clés étrangères.

## Version classique

```mermaid
erDiagram
    UTILISATEUR {
        int id
        string email
        string mot_de_passe
        string telephone
        datetime date_creation
    }

    FAMILLE_ACCUEIL {
        string nom
        string prenom
        string image
        string adresse
        string ville
        string code_postal
        string type_logement
        int surface_logement
        boolean jardin
        int surface_jardin
        string temps_promenade
        string presence_domicile
        string niveau_experience
        string description_experience
        decimal budget_mensuel
    }

    ASSOCIATION {
        string nom
        string image
        string siret
        string description
        string adresse
        string ville
        string code_postal
        string horaires_ouverture
        float latitude
        float longitude
    }

    ANIMAL {
        int id
        string nom
        string race
        string sexe
        boolean sterilise
        int age
        string comportement
        string besoins_specifiques
        string statut
        string image
        datetime date_publication
    }

    ESPECE {
        int id
        string nom
    }

    ANIMAL_FOYER {
        int id
        int age
        boolean sterilise
    }

    DEMANDE_ACCUEIL {
        int id
        datetime date_demande
        string statut
        string message
    }

    REFRESH_TOKEN {
        int id
        string token
        datetime date_emission
        datetime date_expiration
    }

    PASSWORD_RESET_TOKEN {
        int id
        string token
        datetime date_emission
        datetime date_expiration
    }

    UTILISATEUR ||--o| FAMILLE_ACCUEIL : "peut être"
    UTILISATEUR ||--o| ASSOCIATION : "peut être"

    ASSOCIATION ||--o{ ANIMAL : publie
    ESPECE ||--o{ ANIMAL : correspond

    ANIMAL }o--o{ ESPECE : "incompatible avec"

    FAMILLE_ACCUEIL ||--o{ ANIMAL_FOYER : possède
    ESPECE ||--o{ ANIMAL_FOYER : correspond

    FAMILLE_ACCUEIL ||--o{ DEMANDE_ACCUEIL : effectue
    ANIMAL ||--o{ DEMANDE_ACCUEIL : concerne

    UTILISATEUR ||--o{ REFRESH_TOKEN : possède
    UTILISATEUR ||--o{ PASSWORD_RESET_TOKEN : possède
```

### Cardinalités principales

- Un **utilisateur** peut avoir un profil famille d'accueil ou un profil association.
- Une **association** peut publier plusieurs animaux, mais un animal appartient à une seule association.
- Une **espèce** peut concerner plusieurs animaux, mais un animal appartient à une seule espèce.
- Un **animal** peut être incompatible avec plusieurs espèces et une espèce peut être incompatible avec plusieurs animaux.
- Une **famille d'accueil** peut avoir plusieurs animaux dans son foyer.
- Une **famille d'accueil** peut faire plusieurs demandes d'accueil.
- Un **animal** peut recevoir plusieurs demandes d'accueil.
- Un **utilisateur** peut posséder plusieurs jetons de session et de réinitialisation.

## Version Mocodo

https://www.mocodo.net/?mcd=eNqVVE2PmzAQvfMr_AM4NNfc2MRRrRJAQFTtyXJgNusWsGubaPvv6w_COtu0VYWEzXhm3sx7Y7bJ1j41PtS4-Uzb8gsutoj3KTLiO0wp6pkBCiPXmov1801yxYw1-OBtsixV2TR4j2t6ly5Fnwp0aklOmqzFpzpFmw2683jPcsiOJM8xzXa7Eyb5Fk1iTJFU4Fc-sgukiPUKtLabKx8Gu3SiByqFNmywZf-UQAdxgREmkyI9qxfWxZZvTPV8ej-5fRsYpaZSCevGevCoGibr0YuRd9whTfwKbHb9g-LuzBICulNcOjLu7Oe5v4ChNpmeYUhwW2O6dGcJ2fxGyIfOk-g86AEj47a_URjq2mWeAQMDyFcxwaJMpyDo4vGypil3JGtJWTzEjM6TaL-wvrCtuQJz1-c_FHgVitkYTcV8BWVmZR0GW5WZHauDmC5--3BsGtz-ZWgqW-TXst7Hji7-9JQTXPuQu5ZdiwU5ZnnAWnGC0ft_oD2KoYfyGdcu7AHq_12RkDDEeGoVcyOi4c29jZ2ZgTs2Pd-dGKVQZpnWM2jBJ021hI6_8B8zaBfCzGxWhTygnM8D726IK2joIkAHOW9w_rYROyV7fMyKPX5Mh6M0qt5D9XYUpx7e6xjtMNjkSVZVWd3igtQUNxXehZy3bazGor2f0j2m7XP1B99VBe9Kil15rKy6TzmOaotC499RsKy0B-svTKCCjg==
```

## Relations principales

- Un utilisateur peut avoir un profil **famille d'accueil** ou un profil **association**.
- Une association peut publier plusieurs animaux.
- Un animal appartient à une seule espèce.
- Un animal peut être incompatible avec plusieurs espèces.
- Une famille peut renseigner plusieurs animaux déjà présents dans son foyer.
- Une famille peut envoyer plusieurs demandes d'accueil.
- Un animal peut recevoir plusieurs demandes.
- Un utilisateur peut posséder plusieurs jetons de session ou de réinitialisation.

> Dans la base de données, l'exclusivité entre le profil famille et le profil association n'est pas imposée directement par une contrainte SQL. Elle est gérée par le fonctionnement de l'application.
