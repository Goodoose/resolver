# Frontend — React + Vite + TypeScript

Single-page app built with [React 19](https://react.dev), [Vite 8](https://vite.dev) and TypeScript.
Talks to the Python backend in [`../backend`](../backend).

## Requirements

- Node.js 20.19+ or 22.12+ (this repo was set up on Node 24)
- npm 10+

## Setup

```bash
cd frontend
npm install
```

## Launch (development)

```bash
npm run dev
```

Opens on **http://localhost:5173** with hot module replacement — saving a file
updates the browser without a reload.

The backend must be running separately on port 8000 for API calls to work.
See [`../backend/README.md`](../backend/README.md).

## Available scripts

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Dev server on :5173 with HMR                                         |
| `npm run build`   | Type-checks (`tsc -b`) and builds the production bundle into `dist/` |
| `npm run preview` | Serves the built `dist/` locally to verify a production build        |
| `npm run lint`    | Lints with [oxlint](https://oxc.rs)                                  |

## Calling the API

`vite.config.ts` proxies every request starting with `/api` to
`http://localhost:8000`, so the browser sees same-origin requests and CORS never
comes into play during development.

Use relative URLs — never hardcode `http://localhost:8000`:

```ts
const res = await fetch('/api/health')
const data = await res.json() // { status: "ok" }
```

To point the dev server at a different backend, edit the `server.proxy` block in
[`vite.config.ts`](vite.config.ts):

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8000',
  },
}
```

## Project structure

```
frontend/
├── index.html          Entry HTML, loads src/main.tsx
├── public/             Static files served as-is at the site root
├── src/
│   ├── main.tsx        React root, mounts <App /> into #root
│   ├── App.tsx         Root component — start here
│   ├── App.css         Component styles
│   ├── index.css       Global styles
│   └── assets/         Images imported from code (bundled and hashed)
├── vite.config.ts      Vite config: React plugin + /api dev proxy
└── tsconfig*.json      TypeScript configs (app / node / root references)
```

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # sanity-check the output on http://localhost:4173
```

`dist/` is a folder of static files — serve it from any static host or reverse
proxy. In production the Vite dev proxy no longer applies, so route `/api` to the
backend at the web-server level (nginx, Caddy, your hosting provider), or serve
both from the same origin.
