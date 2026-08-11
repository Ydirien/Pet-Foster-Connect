# Diagramme de séquence — Acceptation d'une demande d'accueil

Pour la fonctionnalité complexe, j'ai choisi **l'acceptation d'une demande d'accueil par une association**.

Cette fonctionnalité est intéressante à représenter car elle ne modifie pas seulement la demande sélectionnée : elle change aussi le statut de l'animal et refuse automatiquement les autres demandes encore en attente pour ce même animal.

## Diagramme de séquence

```mermaid
sequenceDiagram
    actor A as Association
    participant F as Frontend React
    participant API as API Express
    participant AUTH as Middleware d'authentification
    participant CTRL as FosterRequest Controller
    participant P as Prisma
    participant DB as PostgreSQL

    A->>F: Clique sur "Accepter la demande"
    F->>API: PATCH /api/demandes/:id/status<br/>{ status: "accepted" }

    API->>AUTH: Vérification de l'utilisateur connecté

    alt Utilisateur non authentifié ou mauvais rôle
        AUTH-->>F: Erreur d'accès
    else Association authentifiée
        AUTH->>CTRL: Transmet la requête

        CTRL->>CTRL: Validation des données avec Zod
        CTRL->>P: Recherche de la demande
        P->>DB: SELECT foster_request + animal
        DB-->>P: Données de la demande
        P-->>CTRL: Demande trouvée

        alt Demande inexistante
            CTRL-->>F: 404 - Demande introuvable
        else Association non propriétaire de l'animal
            CTRL-->>F: 403 - Accès interdit
        else Demande déjà traitée
            CTRL-->>F: 409 - Demande déjà traitée
        else Demande valide
            CTRL->>P: Démarre une transaction

            P->>DB: UPDATE animal<br/>available → in_foster_care

            alt Animal déjà pris en charge
                DB-->>P: Aucun animal modifié
                P-->>CTRL: Annulation de la transaction
                CTRL-->>F: 409 - Demande déjà traitée
            else Animal disponible
                DB-->>P: Animal modifié

                P->>DB: UPDATE demande sélectionnée<br/>pending → accepted
                DB-->>P: Demande acceptée

                P->>DB: UPDATE autres demandes du même animal<br/>pending → rejected
                DB-->>P: Autres demandes refusées

                P->>DB: SELECT demande acceptée
                DB-->>P: Demande + animal mis à jour

                P-->>CTRL: Validation de la transaction
                CTRL-->>API: Demande acceptée
                API-->>F: 200 OK + données mises à jour
                F-->>A: Affiche la demande comme acceptée
            end
        end
    end
```

## Résumé du fonctionnement

Lorsqu'une association accepte une demande, l'API vérifie d'abord que l'utilisateur est bien connecté et possède le rôle `association`.

Le contrôleur vérifie ensuite que la demande existe, qu'elle appartient bien à un animal de cette association et qu'elle est toujours en attente.

L'acceptation est ensuite réalisée dans une **transaction Prisma**. Trois opérations principales sont effectuées :

1. l'animal passe du statut `available` à `in_foster_care` ;
2. la demande sélectionnée passe de `pending` à `accepted` ;
3. les autres demandes encore en attente pour cet animal passent automatiquement à `rejected`.

La transaction permet d'éviter qu'une même demande ou deux demandes différentes pour le même animal soient acceptées en même temps.
