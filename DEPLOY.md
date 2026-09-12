# Déploiement — Smart Document Scanner

## Prérequis
- Docker + Docker Compose
- VPS Linux Ubuntu 22.04 (recommandé)

## Lancement local

```bash
cp .env.example .env
cp backend/.env.docker.example backend/.env.docker
docker compose up -d --build