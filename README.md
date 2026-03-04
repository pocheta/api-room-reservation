# API Room Reservation

API REST de gestion des réservations de salles de réunion, permettant aux utilisateurs de consulter les disponibilités, créer, modifier ou annuler des réservations, avec un accès sécurisé et une gestion efficace de la concurrence.

## Stack technique

- **NestJS** — framework Node.js pour la construction de l'API
- **Prisma 7** — ORM avec migrations et client TypeScript généré
- **PostgreSQL 18** — base de données relationnelle
- **Docker / Docker Compose** — containerisation et orchestration
- **Traefik** — reverse proxy et routage HTTP

## Prérequis

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) v22+

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd api-room-reservation
```

### 2. Configurer les variables d'environnement

```bash
cp docker/database/.env.example docker/database/.env
cp backend/.env.example backend/.env
```

### 3. Ajouter le domaine local

```bash
echo "127.0.0.1 room-reservation.localhost" | sudo tee -a /etc/hosts
```

### 4. Lancer l'infrastructure

```bash
docker compose up -d
```

## Structure du projet

```
api-room-reservation/
├── backend/                  # Code source NestJS
│   ├── src/                  # Modules, controllers, services
│   ├── prisma/
│   │   ├── schema.prisma     # Modèles de données
│   │   └── seed.ts           # Données de seed
│   ├── prisma.config.ts      # Configuration Prisma
│   ├── Dockerfile
│   └── package.json
├── docker/
│   ├── traefik/              # Configuration du reverse proxy
│   └── database/             # Configuration PostgreSQL
└── docker-compose.yml
```

## Variables d'environnement

### `backend/.env`

| Variable       | Description                       | Exemple                                                         |
| -------------- | --------------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`     | Environnement d'exécution         | `development`                                                   |
| `PORT`         | Port d'écoute de l'API            | `3000`                                                          |
| `DATABASE_URL` | URL de connexion à la base de données | `postgresql://postgres:postgres@database:5432/room_reservation` |

### `docker/database/.env`

| Variable            | Description               | Exemple            |
| ------------------- | ------------------------- | ------------------ |
| `POSTGRES_USER`     | Utilisateur PostgreSQL    | `postgres`         |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL   | `postgres`         |
| `POSTGRES_DB`       | Nom de la base de données | `room_reservation` |

## Commandes

### Développement

```bash
npm run start:dev       # Démarre en mode watch
npm run build           # Compile le projet
npm run start:prod      # Démarre en mode production
```

### Base de données

```bash
npm run prisma:migrate  # Crée et applique une migration (dev)
npm run prisma:deploy   # Applique les migrations (prod)
npm run prisma:reset    # Remet à zéro la base et reseed
npm run prisma:seed     # Exécute le seed
npm run prisma:studio   # Interface visuelle Prisma Studio
```

### Qualité de code

```bash
npm run lint            # Analyse et corrige le code (ESLint)
npm run format          # Formate le code (Prettier)
```

### Tests

```bash
npm run test            # Tests unitaires
npm run test:watch      # Tests en mode watch
npm run test:cov        # Tests avec couverture de code
npm run test:e2e        # Tests end-to-end
```

## Accès aux services

| Service           | URL                                    |
| ----------------- | -------------------------------------- |
| API               | http://room-reservation.localhost/api/ |
| Traefik Dashboard | http://localhost:8080                  |

