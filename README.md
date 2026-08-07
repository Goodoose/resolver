# resolver — Forensic Project Teardown (prototype)

Takes the exported records of **one completed project that went badly** and
produces a forensic teardown: where a signal existed but never reached the
person who could act on it, the *real* cause behind each, and a source you can
open behind every claim.

Built to the 8-module spec pack. This is the narrow pilot-winning prototype,
not the live product — read-only, one project, exports in, teardown out.

| Folder      | Stack                      |
| ----------- | -------------------------- |
| `frontend/` | React + Vite + TypeScript  |
| `backend/`  | Python + FastAPI + Uvicorn |

## Run it

Two terminals:

```bash
cd backend  && .venv/bin/uvicorn app.main:app --reload --port 8000
cd frontend && npm start        # opens http://localhost:3000
```

Then click **Start teardown** on the first screen.

## The screens

| Screen              | Module 07 | State                                        |
| ------------------- | --------- | -------------------------------------------- |
| Load & run          | Screen 1  | Real. Operator-facing, deliberately plain     |
| Investigation       | Screen 2  | Real. The dig, the findings, the traceability |
| Interrogation       | Screen 3  | Real — folded into Screen 2, see below        |
| Head-to-head        | Screen 4  | Real, against a fixed baseline transcript     |
| Connectors          | Screen 5  | **Mocked preview**, labelled, inert           |
| Ongoing monitoring  | Screen 6  | **Mocked preview**, labelled, inert           |

Interrogation is the composer at the bottom of the investigation, not a
separate view. Module 07 left that open; the reasoning for the call is in
[`frontend/src/screens/Investigation.tsx`](frontend/src/screens/Investigation.tsx).

## The invariant

*Nothing is asserted that can't be traced to a source.*

That is enforced in the type system rather than requested in a prompt
([`backend/app/models.py`](backend/app/models.py)):

- `Claim.source_ids` has `min_length=1` — an unsourced claim cannot be
  constructed at all.
- `validate_source_refs` rejects claims citing records that weren't ingested,
  which is the failure mode that actually shows up when a model is asked to
  produce citations.
- `Answer` makes sourcing exclusive: an answer either cites, or it declines.
  There is no third shape.
- The fixture is checked at import time, so a broken trace fails the process at
  startup instead of reaching a demo.

Verified — all four leak paths raise, both legitimate shapes pass:

```
blocked  Claim with no sources        -> ValidationError
blocked  Claim citing a fake record   -> ValueError
blocked  sourced Answer, no cites     -> ValidationError
blocked  decline carrying cites       -> ValidationError
ok       sourced claim
ok       honest decline
```

## What is NOT built

**The analysis engine.** Module 06 A1 — *how an unsourced claim is made
structurally impossible, and how accuracy survives a large messy project* — is
tagged blocks-the-build and is unanswered. That is a decision for the team, not
one to make by accident in code.

So the teardown, the interrogation answers, and the baseline transcript are all
fixtures in [`backend/app/fixtures.py`](backend/app/fixtures.py), modelled on
the BMW dealer portal example. Everything above them — the models, the API, the
streaming, every screen — is real and does not care where the records come from.
Replacing that one module with a real engine is the whole swap.

Also not built, all deferred by the spec: live connectors, monitoring, the
nudge/escalation loop, auth, multi-project.

## Docs

- [frontend/README.md](frontend/README.md) — setup, scripts, proxy, structure
- [backend/README.md](backend/README.md) — setup, endpoints, config, structure
