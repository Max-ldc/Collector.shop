# Collector.shop

Collector.shop est une plateforme de vente d'objets de collection permettant aux vendeurs de soumettre des articles et aux administrateurs de les valider avant publication. L'application repose sur une architecture full-stack sécurisée par Keycloak avec un contrôle d'accès basé sur les rôles (RBAC).

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | NestJS 11, TypeORM, PostgreSQL 15 |
| Frontend | React 18, Vite 5, React Router 6, Axios |
| Authentification | Keycloak 23 (SSO, rôles : USER / SELLER / ADMIN) |
| Observabilité | Prometheus, Grafana, OpenTelemetry Collector, prom-client |
| Tests | Jest (backend), Vitest (frontend), k6 (E2E & charge) |
| Qualité de code | SonarCloud, ESLint, Prettier |
| Déploiement | Docker, Azure Container Apps, Azure Container Registry |

## Architecture

Le projet est structuré comme un **monorepo** :

```
apps/
├── backend/          # API REST NestJS
├── frontend/         # Application React (SPA)
└── observability/    # Configuration Prometheus, Grafana, OpenTelemetry
infrastructure/       # Docker Compose, init SQL, config Keycloak, script Azure
tests/                # Tests E2E et de charge (k6)
```

### Backend — API REST

L'API NestJS expose les endpoints suivants sous le préfixe `/api` :

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| `GET` | `/articles` | Public | Liste des articles validés |
| `POST` | `/articles` | SELLER, ADMIN | Créer un article |
| `GET` | `/articles/pending` | ADMIN | Articles en attente de validation |
| `PATCH` | `/articles/:id/validate` | ADMIN | Valider un article |
| `DELETE` | `/articles/:id` | SELLER, ADMIN | Supprimer un article |
| `GET` | `/metrics` | Public | Métriques Prometheus |

**Entité Article** : `id` (UUID), `title`, `description`, `price`, `category`, `status` (PENDING / VALIDATED / REJECTED), `isFlagged`, `sellerId`, `createdAt`, `updatedAt`.

Un service d'analyse de contenu détecte automatiquement les emails et numéros de téléphone dans les descriptions et marque les articles suspects (`isFlagged`).

### Frontend — SPA React

L'application propose les pages suivantes :

- **Accueil** (`/`) — Grille des articles validés (accès public)
- **Connexion** (`/login`) — Authentification via Keycloak
- **Vendre** (`/sell`) — Formulaire de soumission d'article (rôle SELLER)
- **Admin** (`/admin`) — Dashboard de gestion : validation/rejet des articles, liste des articles validés (rôle ADMIN)

Le token Keycloak est automatiquement injecté dans les requêtes API via un intercepteur Axios (avec rafraîchissement auto si expiration < 30s).

### Observabilité

- **Prometheus** scrape les métriques du backend (`/api/metrics`) et de Keycloak
- **Grafana** expose un dashboard pré-configuré avec : taux de succès, SLA disponibilité 24h, trafic API, latence p95
- **OpenTelemetry Collector** collecte et exporte les métriques vers Azure Monitor (Managed Prometheus)
- Le backend enregistre un histogramme (`http_request_duration_seconds`) et un compteur (`http_requests_total`) par requête

## Prérequis

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) v20+ (pour le développement local hors Docker)

## Installation et lancement

### Via Docker Compose (recommandé)

```bash
git clone <url-du-repo>
cd collector/infrastructure
docker-compose up --build
```

Les services démarrés :

| Service | URL | Description |
|---|---|---|
| Frontend | [http://localhost:5173](http://localhost:5173) | Application React (via Nginx) |
| Backend | [http://localhost:3000](http://localhost:3000) | API NestJS |
| Keycloak | [http://localhost:8080](http://localhost:8080) | Console d'administration IAM |
| PostgreSQL | `localhost:5432` | Base de données |

### Variables d'environnement

Le `docker-compose.yml` attend les variables suivantes (via `.env`) :

| Variable | Description |
|---|---|
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Connexion PostgreSQL |
| `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_SECRET` | Configuration Keycloak backend |
| `VITE_API_URL` | URL de l'API (défaut : `http://localhost:3000/api`) |
| `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID` | Configuration Keycloak frontend |
| `KC_DB`, `KC_DB_URL`, `KC_DB_USERNAME`, `KC_DB_PASSWORD` | BDD Keycloak |
| `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD` | Compte admin Keycloak |

## Développement local

### Backend

```bash
cd apps/backend
npm install
npm run start:dev
```

Scripts disponibles :

| Commande | Description |
|---|---|
| `npm run start:dev` | Démarrage en mode watch |
| `npm run test` | Tests unitaires (Jest) |
| `npm run test:cov` | Tests avec couverture |
| `npm run test:e2e` | Tests end-to-end |
| `npm run lint` | Linting ESLint |

### Frontend

```bash
cd apps/frontend
npm install
npm start
```

Scripts disponibles :

| Commande | Description |
|---|---|
| `npm start` | Serveur de développement Vite (port 3000) |
| `npm run build` | Build de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:cov` | Tests avec couverture (v8, format lcov) |
| `npm run lint` | Linting ESLint |

## Tests

### Tests E2E (k6)

Le test fonctionnel (`tests/e2e-test.js`) exécute le workflow complet :
1. Authentification vendeur et admin via Keycloak (Direct Access Grants)
2. Le vendeur crée un article → statut PENDING
3. L'admin consulte les articles en attente, puis valide l'article
4. Nettoyage : suppression de l'article

```bash
k6 run tests/e2e-test.js
```

### Tests de charge (k6)

Le test de charge (`tests/load-test.js`) monte à 50 utilisateurs virtuels simultanés pendant 2 minutes. SLOs : latence p95 < 500ms, taux d'erreur < 1%.

```bash
k6 run tests/load-test.js
```

## Déploiement Azure

Le script `infrastructure/setup-azure.sh` provisionne l'infrastructure sur Azure (région France Central) :

- Resource Group `rg-collector-prod`
- Azure Container Registry (Basic SKU)
- Container Apps Environment `env-collector-prod`
- PostgreSQL Flexible Server (Standard_B1ms, v15, 32 Go)
- Configuration des firewalls et génération des secrets pour le CI/CD GitHub Actions

```bash
cd infrastructure
chmod +x setup-azure.sh
./setup-azure.sh
```

## Qualité de code

Le projet est configuré avec **SonarCloud** (organisation `max-ldc`, projet `Max-ldc_Collector.shop`). L'analyse couvre les deux modules (backend et frontend) avec exclusion des fichiers de test et des répertoires `node_modules`, `dist` et `coverage`.
