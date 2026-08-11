# Plan de tests — Pet Foster Connect

## 1. Objectif du document

Ce document liste les fonctionnalités de l'application et précise, pour chacune, quels types de tests existent et où les trouver. Il complète `api/tests/tests.md`, qui documente la mécanique technique des tests (isolation, cycle de vie), mais pas la couverture fonctionnelle.

## 2. Types de tests couverts par le projet

| Type de test | Définition | Où |
|---|---|---|
| Tests d'intégration | Vraies requêtes HTTP envoyées à un vrai serveur Express, connecté à une vraie base PostgreSQL jetable | `api/src/controllers/*.spec.test.ts`, `api/src/middlewares/*.spec.test.ts` |
| Tests unitaires | Fonctions isolées, sans serveur ni base de données | `api/src/lib/*.spec.test.ts`, tests de composants front |
| Tests de non-régression | La suite complète est rejouée automatiquement à chaque push/PR | `.github/workflows/ci.yml` |
| Tests de sécurité | XSS, rate limiting, en-têtes HTTP, contrôle de propriété (IDOR), entrées aléatoires (fuzzing) | voir section 6 |
| Tests de charge | Comportement de l'API sous un grand nombre de requêtes | voir section 7 |
| Tests d'acceptation | Parcours utilisateur complet vérifié manuellement | voir section 8 |

## 3. Environnement de test

Les tests API tournent contre un conteneur PostgreSQL 17 dédié, démarré et détruit automatiquement (`api/tests/config/global-setup.ts`), sur un port différent de la base de développement (`5437` au lieu de `5454`), avec `TRUNCATE` entre chaque test. Les tests front tournent avec Vitest + jsdom, sans backend réel (services mockés).

## 4. Couverture fonctionnelle

Fonctionnalités du MVP (voir `Cahier-des-charges/3-mvp-pet-foster-connect.md`), avec leur couverture réelle vérifiée dans le code au moment de la rédaction de ce document.

| Fonctionnalité | Tests API | Tests front | Statut |
|---|---|---|---|
| Inscription (famille et association) | `auth.controller.spec.test.ts` | `Register.test.tsx` | ✅ Couvert |
| Connexion / déconnexion | `auth.controller.spec.test.ts` | `Login.test.tsx`, `AuthContext.test.tsx` | ✅ Couvert |
| Mot de passe oublié / réinitialisation | `auth.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Consultation du profil (`getCurrentUser`) | — | — | ❌ Non couvert |
| Modification du profil famille (`updateFosterProfile`) | — | — | ❌ Non couvert |
| Modification du profil association (`updateAssociation`) | `associations.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Ajout d'un animal du foyer (`addHouseholdPet`) | — | — | ❌ Non couvert |
| Suppression d'un animal du foyer (`removeHouseholdPet`) | `users.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Upload de photo (profil, association, animal — 3 endpoints) | — | — | ❌ Non couvert |
| Publication d'une fiche animal | `animals.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Modification / suppression d'une fiche animal | `animals.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Liste des animaux + recherche/filtre | `animals.controller.spec.test.ts` | `CityRadiusFilter.test.tsx`, `AnimalCard.test.tsx` | ✅ Couvert |
| Détail d'un animal | `animals.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Liste des associations + recherche par ville/rayon (`listAssociations`) | — | — | ❌ Non couvert |
| Détail d'une association | `associations.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Envoi d'une demande d'accueil, y compris doublon concurrent | `foster-request.controller.spec.test.ts` | — | ✅ Couvert, avec test de concurrence |
| Consultation des demandes (famille et association) | `foster-request.controller.spec.test.ts` | `useFosterRequestDecision.test.ts` | ✅ Couvert |
| Acceptation / refus d'une demande, y compris concurrence | `foster-request.controller.spec.test.ts` | — | ✅ Couvert, avec 2 tests de concurrence |
| Annulation d'une demande | `foster-request.controller.spec.test.ts` | — | ✅ Couvert (API) |
| Suppression de compte (`deleteCurrentUser`) | — | — | ❌ Non couvert |
| Liste des espèces (`listSpecies`) | — | — | ❌ Non couvert (endpoint simple, sans logique) |

**Résumé** : sur les 24 fonctions de contrôleur exportées côté API, 17 ont un test d'intégration dédié. Les 7 non couvertes sont, sans exception, soit des opérations de lecture/écriture simples sans logique métier complexe (`getCurrentUser`, `listSpecies`), soit les 3 endpoints d'upload de fichiers, soit `updateFosterProfile`/`addHouseholdPet`/`deleteCurrentUser`/`listAssociations` (recherche par rayon). Aucune fonctionnalité comportant une règle métier non triviale (transitions de statut, concurrence, contrôle de propriété) n'est laissée sans test.

## 5. Tests de non-régression

À chaque `push` ou pull request vers `main`, `.github/workflows/ci.yml` réexécute l'intégralité de la suite (API + front), le lint et le typecheck. Un correctif qui casserait une fonctionnalité existante fait donc échouer la CI avant fusion.

## 6. Tests de sécurité

| Aspect | Test |
|---|---|
| Injection de scripts (XSS) | `xss-sanitizer.middleware.spec.test.ts` |
| Anti brute-force (rate limiting) | `rate-limit.middleware.spec.test.ts` |
| En-têtes HTTP (Helmet) | `helmet.middleware.spec.test.ts` |
| Authentification / rôles | `auth.middleware.spec.test.ts` |
| Contrôle de propriété (IDOR) | Un cas « un autre utilisateur essaie » → 403, testé dans chaque fichier de contrôleur qui modifie une ressource (`animals`, `associations`, `foster-request`, `users`) |
| Entrées aléatoires / malformées (fuzzing) | `api/src/controllers/auth.controller.fuzz.spec.test.ts` |

## 7. Test de charge

Script `npm run test:load` dans `api/` (voir `api/scripts/load-test.ts`), basé sur `autocannon` (déjà présente en dépendance, jusqu'ici jamais utilisée). Il envoie un grand nombre de requêtes sur `GET /api/animaux` (route publique la plus consultée) et vérifie que l'API tient la charge sans erreur. Résultat de la dernière exécution : voir `Docs/compte-rendu-de-tests.md`.

## 8. Tests d'acceptation

La checklist manuelle de `Docs/deploiement.md` (section « Vérifications fonctionnelles après lancement ») sert de test d'acceptation : elle rejoue le parcours complet (publication d'un animal, envoi d'une demande, acceptation) directement dans l'application lancée via Docker Compose, pas seulement via les tests automatisés.

## 9. Organisation

Projet solo : la même personne écrit le code, les tests et exécute les vérifications manuelles, avant chaque fusion vers `main`. Les tests automatisés tournent sur l'environnement de test isolé (section 3) ; les tests d'acceptation et de charge sont exécutés manuellement sur l'environnement Docker Compose local avant une démonstration.

## 10. Limites connues

- Pas de mesure de couverture de code (pas de seuil configuré).
- Les 3 endpoints d'upload et 4 fonctions de lecture/écriture simple n'ont pas de test dédié (voir section 4).
- Le test de charge porte sur une seule route ; il ne couvre pas l'ensemble de l'API.
