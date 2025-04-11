# Dockerfile
FROM node:0.10.48

# Crée un dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers du projet
COPY . .

# Installe les dépendances (npm v2.x utilisé automatiquement)
RUN npm install
RUN mkdir -p /app/logs

# Expose le port utilisé par le serveur
EXPOSE 8000

# Lance le serveur
# CMD ["node", "server/js/main.js"] 
CMD node server/js/main.js >> /app/logs/node.log 2>&1
