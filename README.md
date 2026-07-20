# Incident Management

[![CI](https://github.com/Muhammed-Ozberk/incident-management/actions/workflows/ci.yml/badge.svg)](https://github.com/Muhammed-Ozberk/incident-management/actions/workflows/ci.yml)

Real-time incident management dashboard with NestJS, PostgreSQL, Socket.IO and AI-assisted triage.

![Incident Management dashboard](docs/images/dashboard.png)

## Demo

The demo follows an incident from intake through AI-assisted prioritization and a real-time status update.

![Incident creation and triage demo](docs/images/demo.gif)

The saved AI summary is available directly from each incident record:

![AI-generated incident summary](docs/images/ai-summary.png)

## Incident lifecycle

1. **Create** — Operators submit a title, description, affected service, and initial severity from the dashboard or REST API. Every incident starts in the `open` state and its creation is recorded in the audit log.
2. **Prioritize** — Severity (`low`, `medium`, `high`, or `critical`) expresses urgency. AI-assisted triage can recommend both severity and the affected service from the incident context, while operators retain final control.
3. **Assign** — Selecting the affected registered service assigns the incident to that service as the current ownership boundary. The data model does not yet include individual on-call assignment, so the documentation does not imply that it does.
4. **Update in real time** — Status changes move an incident through `open`, `investigating`, and `resolved`. After PostgreSQL commits the change, Socket.IO broadcasts `incident.created`, `incident.updated`, or `incident.deleted`; connected dashboards refresh their list, metrics, and notifications immediately.
5. **Summarize with AI** — Operators can generate a concise incident summary. The summary is persisted in PostgreSQL, reused on later views, and can be regenerated. Without a Gemini API key, a deterministic fallback keeps the flow usable.

## Features

- Centralized incident intake, filtering, pagination, and metrics
- Registered service catalog and service-based ownership
- Severity and status workflows with audit history
- Real-time dashboard synchronization and connection status
- AI-assisted severity/service suggestions and persisted summaries
- Soft deletion for incidents and deactivation for services
- Swagger/OpenAPI documentation and a Postman collection
- Unit, UI, end-to-end, and containerized PostgreSQL integration tests

## Technology

| Area | Stack |
| --- | --- |
| Backend | NestJS, TypeScript, Prisma ORM, PostgreSQL |
| Real time | Socket.IO, Socket.IO Client |
| AI | Google Gemini SDK with deterministic fallback |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Lucide |
| Testing | Jest, Vitest, Supertest, Testcontainers |
| Tooling | Docker Compose, Swagger/OpenAPI, Postman |

## Repository structure

```text
backend/
  prisma/                 # Schema, migrations, and seed data
  scripts/                # Incident simulator
  src/
    common/               # Filters and interceptors
    database/             # Prisma integration
    modules/               # AI, incidents, realtime, and services
  test/                   # E2E and Testcontainers integration tests
frontend/
  src/
    components/
    features/             # Incident and service UI modules
    pages/
docs/images/              # README screenshots and demo GIF
postman/                  # API collection
```

## Getting started locally

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 16, or Docker for the included database

### 1. Clone the repository

```bash
git clone https://github.com/Muhammed-Ozberk/incident-management.git
cd incident-management
```

### 2. Start PostgreSQL

Either start the root Compose service:

```bash
docker compose up -d
```

or provide your own PostgreSQL database. The default local connection is:

```text
Host: localhost
Port: 5432
Database: incidents
User: postgres
Password: postgres
```

### 3. Configure and start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run seed
npm run dev
```

The example backend environment is:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/incidents?schema=public"
PORT=3001
FRONTEND_ORIGIN="http://localhost:3000"
GEMINI_API_KEY=""
GOOGLE_AI_MODEL="gemini-2.5-flash"
```

The API runs at `http://localhost:3001`; Swagger is available at `http://localhost:3001/api-docs`.

### 4. Configure and start the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The example frontend environment is:

```dotenv
VITE_API_URL="http://localhost:3001"
VITE_SOCKET_URL="http://localhost:3001"
```

Open `http://localhost:3000`.

## Run the complete stack with Docker

Create `backend/.env` first, then run from the repository root:

```bash
./scripts/docker-stack.sh up
```

Default Docker endpoints:

```text
Frontend:          http://localhost:3000
Backend:           http://localhost:3001
Swagger:           http://localhost:3001/api-docs
PostgreSQL (host): localhost:5433
```

Available stack commands are `up`, `down`, `restart`, `logs`, `ps`, and `build`.

## Tests

Backend unit tests:

```bash
cd backend
npm test
```

PostgreSQL integration test with Testcontainers:

```bash
cd backend
npm run test:integration
```

This test requires a running Docker daemon. It starts a disposable PostgreSQL 16 container, applies the real Prisma migrations, verifies incident persistence through the NestJS API, and removes the container afterward. No developer database or fixed host port is used.

Existing backend E2E tests use the `DATABASE_URL` configured in `backend/.env`:

```bash
cd backend
npm run test:e2e
```

Frontend tests:

```bash
cd frontend
npm test
```

Build verification:

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## Incident simulator

With the backend and database running:

```bash
cd backend
npm run simulate
```

The simulator reads `backend/scripts/data/incident-simulator-data.json`, resolves registered services through the API, and creates incidents at intervals to demonstrate live UI synchronization.

## API overview

```text
GET    /incidents/stats
GET    /incidents?page=1&limit=10&status=open&severity=high&serviceId=<id>
GET    /incidents/:id
POST   /incidents
PATCH  /incidents/:id
DELETE /incidents/:id
POST   /incidents/ai-suggest
POST   /incidents/:id/ai-summary

GET    /services
GET    /services/:id
POST   /services
PATCH  /services/:id
DELETE /services/:id
```

Successful responses use `{ "status": true, "message": "...", "data": ... }`; errors use `{ "status": false, "message": "..." }`. Ready-to-run examples are in `postman/incident-management.postman_collection.json`.

## Architecture notes

The backend is organized by feature and then by application, domain, infrastructure, and presentation layers. Controllers handle transport concerns, application services enforce workflow rules, repositories isolate Prisma access, and real-time events are emitted only after database operations succeed.

The frontend follows the same feature-oriented approach. Incident API calls, types, state hooks, Socket.IO event handling, and UI components live together under `frontend/src/features/incidents`.

## License

This project is available under the [MIT License](LICENSE).
