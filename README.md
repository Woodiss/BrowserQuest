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

