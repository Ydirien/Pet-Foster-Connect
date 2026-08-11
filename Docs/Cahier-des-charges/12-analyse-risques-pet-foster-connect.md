# Analyse des risques

Pendant le développement de Pet Foster Connect, plusieurs risques peuvent apparaître. L'objectif est de les identifier à l'avance pour limiter leur impact sur le projet.

| Risque | Conséquence possible | Mesure prévue |
|---|---|---|
| Mauvaise compréhension du besoin | Développer une fonctionnalité qui ne correspond pas au projet | Relire le cahier des charges et valider les fonctionnalités avant de commencer |
| Retard dans le développement | Certaines fonctionnalités du MVP peuvent ne pas être terminées | Prioriser le MVP et découper le travail en petites tâches |
| Conflits Git | Perte de temps ou écrasement de modifications | Travailler sur des branches séparées et faire des pull requests |
| Différences d'environnement entre les postes | Le projet fonctionne chez un développeur mais pas chez un autre | Utiliser Docker et Docker Compose pour avoir le même environnement |
| Erreur dans la base de données | Données incohérentes ou perte de données | Utiliser Prisma, les migrations et des contraintes dans la base |
| Faille de sécurité sur l'authentification | Accès non autorisé à des comptes ou données | Hacher les mots de passe, utiliser des tokens et protéger les routes sensibles |
| Données envoyées par l'utilisateur non valides | Erreurs serveur ou données incorrectes en base | Valider les données reçues avec Zod avant de les traiter |
| Trop de requêtes sur certaines routes | Risque d'abus ou de surcharge | Mettre en place une limitation de requêtes avec `express-rate-limit` |
| Upload d'image incorrect ou trop lourd | Erreur lors de l'envoi ou problème de stockage | Contrôler les fichiers envoyés et optimiser les images avec Sharp |
| Régression après une modification | Une fonctionnalité déjà terminée peut ne plus fonctionner | Ajouter des tests et vérifier les fonctionnalités principales avant de fusionner |
| Problème de communication dans l'équipe | Tâches en doublon ou décisions différentes | Faire des points réguliers et garder une répartition claire des tâches |
| Dépendance externe indisponible | Certaines fonctionnalités peuvent ne plus fonctionner correctement | Gérer les erreurs et prévoir un comportement correct en cas d'échec |

Cette analyse permet surtout de prévoir les problèmes les plus probables et d'éviter qu'ils bloquent complètement le développement.
