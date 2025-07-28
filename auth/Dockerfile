# Utilise l'image officielle Node.js
FROM node:22

# Définit le répertoire de travail
WORKDIR /usr/src/app

# Copie uniquement les fichiers de dépendances en premier (meilleur cache)
COPY package*.json ./

# Installe toutes les dépendances (y compris devDependencies)
RUN npm install

# Copie le reste des fichiers de l'application
COPY . .

# Définit la variable d'environnement pour permettre les imports ESM et les tests
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
