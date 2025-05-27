# Dockerfile

FROM node:20

# Crée le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie package.json et installe les dépendances
COPY package*.json ./
RUN npm install

# Copie tout le code source
COPY . .

# Définit le conteneur comme interactif (à attendre des commandes)
CMD ["tail", "-f", "/dev/null"]
