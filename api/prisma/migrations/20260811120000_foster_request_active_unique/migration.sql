-- Anti-doublon "une seule demande active par couple famille d'accueil / animal",
-- appliqué par Postgres lui-même (index unique partiel) et non plus seulement
-- par un contrôle applicatif : deux requêtes de création concurrentes pour le
-- même couple ne peuvent donc plus toutes les deux réussir, même si elles
-- passent la vérification de l'application au même instant.
--
-- Index "partiel" (clause WHERE) car la règle ne porte que sur les demandes
-- actives : une demande "rejected" ou "cancelled" ne doit pas bloquer une
-- nouvelle demande pour le même animal.
CREATE UNIQUE INDEX "foster_requests_active_unique"
ON "foster_requests" ("foster_id", "animal_id")
WHERE "status" IN ('pending', 'accepted');
