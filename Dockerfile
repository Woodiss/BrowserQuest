# Utiliser l'image Node.js officielle comme base
FROM node:16

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tout le code source du projet dans le conteneur
COPY . .

# Exposer le port sur lequel l'application écoute (par défaut, BrowserQuest utilise le port 8080)
EXPOSE 8080

# Démarrer l'application
CMD ["npm", "start"]
