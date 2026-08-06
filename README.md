# resolver

Monorepo with two apps:

| Folder      | Stack                       |
| ----------- | --------------------------- |
| `frontend/` | React + Vite + TypeScript   |
| `backend/`  | Python + FastAPI + Uvicorn  |

## Frontend

```bash
cd frontend
npm install
npm start        # http://localhost:3000 (opens the browser automatically)
npm run build
```

Requests to `/api/*` are proxied to the backend at `http://localhost:8000` (see `frontend/vite.config.ts`).

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Health check: http://localhost:8000/api/health
- OpenAPI docs: http://localhost:8000/docs

Copy `.env.example` to `.env` to override settings.
