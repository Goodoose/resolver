# Backend — Python + FastAPI

REST API built with [FastAPI](https://fastapi.tiangolo.com) and served by
[Uvicorn](https://www.uvicorn.org). Consumed by the React app in
[`../frontend`](../frontend).

## Requirements

- Python 3.9+ (the local venv was created with the system Python 3.9.6)

> Python 3.9 has reached end of life. Everything here works on it, but if you
> install a newer Python, delete `.venv` and recreate it with the steps below.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Launch (development)

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Or without activating the venv:

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
```

`--reload` restarts the server whenever a `.py` file changes.

Once running:

| URL                                | What it is                            |
| ---------------------------------- | ------------------------------------- |
| http://localhost:8000/docs         | Swagger UI — try endpoints in-browser |
| http://localhost:8000/redoc        | ReDoc API reference                   |
| http://localhost:8000/openapi.json | OpenAPI schema                        |

Quick check:

```bash
curl http://localhost:8000/api/health
```

## Endpoints

| Method | Path                   | Returns                                            |
| ------ | ---------------------- | -------------------------------------------------- |
| GET    | `/api/health`          | `{"status": "ok"}`                                  |
| GET    | `/api/project`         | Project metadata (name, record counts)              |
| GET    | `/api/sources`         | The full record set — what every claim traces to    |
| GET    | `/api/teardown`        | The complete teardown, all at once                  |
| GET    | `/api/teardown/stream` | SSE: dig steps one at a time, then the result       |
| POST   | `/api/interrogate`     | `{question}` → a sourced answer, or an honest decline |
| GET    | `/api/benchmark`       | The naive-baseline transcript for the head-to-head  |

Every route is read-only. There is no write path in the service, which is what
makes the read-only promise to the buyer structural rather than procedural.

`/api/teardown/stream` exists separately from `/api/teardown` so the UI *cannot*
render the verdict early — it does not have it until the dig finishes. Watch it:

```bash
curl -N http://localhost:8000/api/teardown/stream
```

## The sourcing invariant

[`app/models.py`](app/models.py) makes an unsourced claim unconstructable rather
than discouraged. `Claim.source_ids` requires at least one entry,
`validate_source_refs` rejects citations to records that weren't ingested, and
`Answer` forces sourcing to be exclusive — cite, or decline, no third shape.
[`app/fixtures.py`](app/fixtures.py) is validated at import, so a broken trace
kills the process at startup instead of reaching a demo.

This is deliberately *not* an answer to Module 06 A1 (that's the team's call on
how the engine works). It's the boundary the engine will have to come through.

## Configuration

Settings live in [`app/config.py`](app/config.py) and are loaded by
`pydantic-settings` from environment variables or a `.env` file. Copy the example
to get started:

```bash
cp .env.example .env
```

| Variable       | Default                       | Purpose                                      |
| -------------- | ----------------------------- | -------------------------------------------- |
| `APP_NAME`     | `resolver-api`                | Title shown in the OpenAPI docs               |
| `CORS_ORIGINS` | `["http://localhost:3000"]`   | Origins allowed to call the API (JSON list)   |

`.env` is gitignored; `.env.example` is committed as the template.

## Project structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py         FastAPI app, CORS middleware, router mount
│   ├── api.py          All routes. Read-only by construction
│   ├── models.py       Domain types + the sourcing invariant
│   ├── fixtures.py     The BMW demo project — swap this for real ingest
│   └── config.py       Settings loaded from env / .env
├── requirements.txt    Python dependencies
├── .env.example        Template for local .env
└── .venv/              Virtualenv (gitignored)
```

`fixtures.py` is the seam. It holds the records, the teardown that cites them,
the interrogation answers, and the baseline transcript. Nothing downstream knows
where the records came from — replacing this one module with a real ingest and a
real engine is the whole swap.

## Adding an endpoint

Add it to [`app/main.py`](app/main.py):

```python
@app.get("/api/items")
def list_items() -> list[dict]:
    return [{"id": 1, "name": "example"}]
```

Prefix routes with `/api` so the frontend dev proxy picks them up. With
`--reload` on, the change is live immediately and appears in `/docs`.

As the API grows, split routes into `app/routers/*.py` and mount them with
`app.include_router(...)` instead of piling everything into `main.py`.

## Adding a dependency

```bash
source .venv/bin/activate
pip install <package>
pip freeze > requirements.txt
```

## Running in production

Drop `--reload` and run multiple workers:

```bash
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Set `CORS_ORIGINS` to your real frontend origin — the default only allows the
local Vite dev server.
