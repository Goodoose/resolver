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
npm start
```

Serves on **http://localhost:3000** and opens your default browser automatically.
Hot module replacement is on — saving a file updates the page without a reload.

The port is pinned in [`vite.config.ts`](vite.config.ts) with `strictPort: true`,
so if something else already holds 3000 the dev server fails loudly instead of
silently moving to another port (which would break the backend's CORS allowlist).
To use a different port, change `server.port` there and update `CORS_ORIGINS` in
[`../backend/.env`](../backend/.env.example) to match.

The backend must be running separately on port 8000 for API calls to work.
See [`../backend/README.md`](../backend/README.md).

## Available scripts

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm start`       | Dev server on :3000 with HMR, opens the browser                      |
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
├── index.html                  Entry HTML, loads src/main.tsx
├── src/
│   ├── main.tsx                React root
│   ├── App.tsx                 Shell: rail, top bar, run state, screen switch
│   ├── api.ts                  Typed client + the SSE reader for the dig
│   ├── index.css               Design tokens (palette) + reset
│   ├── App.css                 All component styles
│   ├── components/
│   │   ├── Cited.tsx           Citation chips + inline evidence
│   │   └── icons.tsx           Rail icons + source-kind marks
│   └── screens/
│       ├── LoadRun.tsx         Screen 1 · operator
│       ├── Investigation.tsx   Screens 2+3 · the dig, findings, interrogation
│       ├── HeadToHead.tsx      Screen 4 · benchmark
│       └── Previews.tsx        Screens 5+6 · labelled mocks
├── vite.config.ts              React plugin + /api dev proxy
└── tsconfig*.json              TypeScript configs
```

No router library: the shell switches screens from local state. Five screens
with no deep-linking requirement didn't justify the dependency.

### Two things worth knowing before editing

**Evidence expands inline.** A citation opens *directly under the claim it
belongs to* — never a modal, never a navigation. Getting from a claim to the
record and back without losing your place is the single most important
interaction in the product; anything that covers the page costs exactly that.

**The dig is streamed, not simulated.** `runTeardown` in
[`src/api.ts`](src/api.ts) reads server-sent events. The UI cannot render the
verdict early because it does not have it yet — the steps and the result arrive
as separate events. Don't replace this with a client-side timer over a
fully-loaded result; that would make the visible reasoning theatre.

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # sanity-check the output on http://localhost:4173
```

`dist/` is a folder of static files — serve it from any static host or reverse
proxy. In production the Vite dev proxy no longer applies, so route `/api` to the
backend at the web-server level (nginx, Caddy, your hosting provider), or serve
both from the same origin.
