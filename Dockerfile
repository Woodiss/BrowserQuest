FROM node:14

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package.json ./
COPY package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposition du port du serveur
EXPOSE 8000

# Commande pour démarrer le serveur
CMD ["node", "server/js/main.js"]