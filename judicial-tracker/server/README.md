# Court Services Backend — Dossier Tracking API

Node.js + Express backend for the Moroccan judicial dossier tracking dashboard.

## Quick Start

```bash
npm install
npm run dev        # nodemon hot-reload on port 5000
npm start          # production
```

## API

### POST `/api/dossier/search`

**Format A — structured:**
```json
{
  "tribunal": "casablanca",
  "annee": 2024,
  "code": "A",
  "numero": "4521"
}
```

**Format B — dossier string:**
```json
{
  "dossier": "A/4521/2024",
  "tribunal": "casablanca"
}
```

### GET `/api/dossier/formats` — input format docs
### GET `/health` — server health check

## Mock cases (work out of the box)

| Dossier       | Tribunal   | Status     |
|---------------|------------|------------|
| A/4521/2024   | casablanca | En cours   |
| C/1837/2023   | rabat      | Jugé       |
| F/9104/2024   | marrakech  | En attente |
| B/3320/2023   | tcom-casa  | Reporté    |
| E/0718/2025   | tadm-rabat | En cours   |

## Environment variables

Copy `.env.example` → `.env` and set values. Key variables:

| Variable            | Default                      | Description                  |
|---------------------|------------------------------|------------------------------|
| `PORT`              | `5000`                       | HTTP server port              |
| `USE_MOCK`          | `true`                       | Use mock DB (set false for live) |
| `CORS_ORIGINS`      | `http://localhost:5173`      | Comma-separated frontend URLs |
| `RATE_LIMIT_MAX`    | `100`                        | Requests per 15 min window    |

## Connecting to real Mahakim API

1. Set `USE_MOCK=false` in `.env`
2. Fill `MAHAKIM_API_KEY` and `MAHAKIM_BASE_URL`
3. Implement `searchLive()` in `src/services/dossierService.js`
