# Pet Foster Connect — Frontend

Interface web du projet Pet Foster Connect, développée avec React, TypeScript et Vite.

Pour une présentation générale du projet (fonctionnalités, stack complète, démarrage avec Docker), voir le [README à la racine du dépôt](../README.md).

## Prérequis

- Node.js 24 ou une version compatible
- L'API du projet (dossier `api/`) doit tourner pour que l'application ait des données à afficher

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner l'URL de l'API :

```env
VITE_API_URL=http://localhost:3010/api
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Vérifie le typage TypeScript puis génère le build de production |
| `npm run preview` | Prévisualise le build de production en local |
| `npm run lint` | Analyse le code avec Oxlint |
| `npm test` | Exécute les tests une fois (Vitest) |
| `npm run test:watch` | Exécute les tests en mode watch |

## Structure du projet

```text
src/
├── assets/       # Images, logos
├── components/   # Composants réutilisables (auth, layout, common)
├── context/      # Contexte React (authentification)
├── hooks/        # Hooks personnalisés
├── pages/        # Pages de l'application, une par route
├── routes/       # Déclaration des routes (React Router)
├── services/     # Appels à l'API
├── styles/       # Variables CSS globales (couleurs, typographies, espacements)
└── types/        # Types TypeScript partagés
```

Le détail du cahier des charges, des maquettes et des documents de conception se trouve dans le dossier [`Docs/`](../Docs/) à la racine du dépôt.
