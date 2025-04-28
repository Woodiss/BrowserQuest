# 🕹️ BrowserQuest - Projet Réseau avec Load Balancer & Failover

> **Un clone multijoueur du jeu BrowserQuest, entièrement conteneurisé avec Docker, équilibré via NGINX et tolérant aux pannes — développé directement à partir du dépôt originel de Mozilla (et non un fork modifié).**

---

## 👥 Membres du groupe

| Nom         | Prénom       | GitHub                                      |
|-------------|--------------|---------------------------------------------|
| Descarpentries | Stéphane | [github.com/Woodiss](https://github.com/Woodiss) |
| Amaury | Sanchez | [github.com/Amaury057](https://github.com/Amaury057) |
| Christopher | DE PASQUAL | [github.com/christopherDEPASQUAL](https://github.com/christopherDEPASQUAL) |
| Devanandhan | Codandabany | [github.com/MrDevaa](https://github.com/MrDevaa) |
| Adrien  | Allard (Malade)| [github.com/The-Leyn](https://github.com/The-Leyn) |

---

## 📦 Objectif du projet

- Héberger le jeu **BrowserQuest** dans un environnement Dockerisé.
- Lancer plusieurs serveurs de jeu (`browserquest1`, `browserquest2`, etc.).
- Utiliser **NGINX comme Load Balancer** pour répartir les connexions.
- Gérer automatiquement le **failover**
- Ajout d'une sécurité: limite le nombre de connexion par IP

---

## ⚙️ Technologies utilisées

- 🐳 **Docker** & **docker-compose**
- 🔁 **Nginx** (load balancer + reverse proxy WebSocket)
- 🎮 **BrowserQuest** (jeu Node.js)
- 🔧 **WebSocket**

## 🚀 Lancer le projet

```bash
git clone https://github.com/Woodiss/BrowserQuest.git
cd browserquest
docker-compose up --build
```

## 🔍 Pistes explorées non retenues dans la version finale

- **Système de sessions persistantes entre serveurs**
  > Objectif : permettre à un joueur de reconnecter automatiquement à un autre serveur après un crash sans perte de données.
  > Approche envisagée : centralisation des données de session dans un conteneur Memcached.
  > Statut : testé, mais trop complexe à intégrer dans les délais impartis.

- **Détection active des crash serveurs pour migration transparente**
  > Objectif : supervision continue + migration automatique des joueurs en cas de panne.
  > Idée : observer les connexions WebSocket côté client et re-router sur un autre serveur sans écran de chargement.
  > Statut : testé, mais trop complexe à intégrer dans les délais impartis.

- **Déploiement Kubernetes (Haute Disponibilité et Failover)**
  > Objectif : garantir la continuité du service BrowserQuest en cas de montée en charge ou de panne d'un serveur.
  > Idée : utiliser Kubernetes pour automatiser le déploiement, la gestion du scaling (nombre de pods) et le redémarrage automatique en cas de défaillance.
  > Emplacement : branch Devanandhan dossier /K8s.
  > Déploiements partiels créés, mais pas de montée en production.
  > Besoin de corriger les configurations réseau et les services exposés.
  > Statut : prototype amorcé mais non finalisé

- **Sécurisation et protection contre les spams**
  > Objectif : renforcer la sécurité de l'application et éviter les spams ainsi que les injections via le chat.
  > Idée : Sécurisation et optimisation du code pour éviter les injections via le chat de l'app et sécuriser l'app des spams.
  > Emplacement : racine du projet pour Fail2Ban (branche DP) et dossier Server/js pour security.js et main.js.
  > Modifications : sécurisation et optimisation du code pour filtrer les messages du chat et prévenir les attaques par injection dans le fichier WS.js, création du fichier server/js/security.js pour la logique de sécurité et son utilisation dans main.js.
  > Statut : Fail2ban testé se lance, mais impossible d'avoir le statut et ainsi ban les utilisateurs qui spams.