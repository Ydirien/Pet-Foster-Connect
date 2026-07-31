# Image de base : Node.js version 24, variante "alpine" (légère, ~5-10x plus petite qu'une image standard)
FROM node:24-alpine

# Définit le dossier de travail à l'intérieur du conteneur
# Toutes les commandes suivantes (COPY, RUN, CMD) s'exécuteront depuis ce dossier
WORKDIR /app

# Copie uniquement les fichiers package.json et package-lock.json
# On le fait avant le reste du code pour profiter du cache Docker :
# si ces fichiers ne changent pas, Docker réutilise le cache et évite de refaire npm ci à chaque build
COPY package*.json ./

# Installe les dépendances de façon stricte et reproductible à partir du package-lock.json
# (plus rapide et plus fiable que "npm install" pour un environnement de prod/CI)
RUN npm ci

# Copie le reste du code source de l'application dans le conteneur
COPY ./ ./

# Génère le client Prisma à partir du schema.prisma
# Nécessaire car le client Prisma dépend de l'OS/architecture cible (ici alpine)
RUN npx prisma generate

# Documente le port utilisé par l'application (informatif, ne publie pas réellement le port)
# Le mapping réel se fait via "docker run -p" ou docker-compose
EXPOSE 3000

# Commande exécutée au démarrage du conteneur : lance le script "docker:start" défini dans package.json
CMD ["npm", "run", "docker:start"]