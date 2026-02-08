# Collector.shop

Collector.shop est une plateforme de vente d'objets de collection basée sur une architecture micro-services.

## Architecture

Ce projet est structuré comme un monorepo :

- **apps/backend** : API NestJS (Node.js).
- **apps/frontend** : Application React (Vite).
- **infrastructure** : Configuration Docker Compose (PostgreSQL, Keycloak).

## Prérequis

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v20+ recommandé pour le développement local hors Docker)

## Installation et Lancement

Pour lancer l'ensemble de la stack (Backend, Frontend, Base de données, Keycloak) en local :

1. Clonez le repository :
   ```bash
   git clone <url-du-repo>
   cd collector
   ```

2. Lancez les conteneurs via Docker Compose :
   ```bash
   cd infrastructure
   docker-compose up --build
   ```

3. Accédez aux applications :
   - Frontend : [http://localhost:5173](http://localhost:5173)
   - Backend : [http://localhost:3000](http://localhost:3000)
   - Keycloak : [http://localhost:8080](http://localhost:8080)

## Développement

### Backend
```bash
cd apps/backend
npm install
npm run start:dev
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```
