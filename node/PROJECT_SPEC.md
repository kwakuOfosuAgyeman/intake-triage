# Project A (Node.js): AI-Assisted Intake Triage (Heuristic Classifier)

## Goal
Build a small full-stack application that captures intake requests and routes them into a simple admin review queue.
Classification MUST be **heuristic-only** (keyword/rules), with no external LLM dependency.

## Time box
2 hours maximum.

## Functional requirements

### Intake creation (public)
- A web form that captures:
  - name
  - email
  - short description (free text)
  - urgency (1–5)
- On submit, create an Intake record.

### Heuristic classification (required)
When an intake is created, set `category` using heuristics:
- `billing`
- `technical_support`
- `new_matter_project`
- `other`

Rules are up to you. They should be:
- deterministic
- easy to audit
- documented in code comments or README

Examples (illustrative only):
- "invoice", "payment", "bill" → billing
- "login", "error", "broken", "bug", "can't access" → technical_support
- "quote", "new project", "engagement", "proposal" → new_matter_project
- otherwise → other

### Admin queue (protected)
Provide a simple admin UI with:
- list view (table)
  - filter by `status` and `category`
  - sort by created date (desc)
- detail view
- update:
  - status: `new`, `in_review`, `resolved`
  - internal_notes (text)

### API (required)
Expose REST endpoints (minimum):
- POST `/api/intakes`
- GET `/api/intakes` (supports `status` and `category` query params)
- GET `/api/intakes/:id`
- PATCH `/api/intakes/:id`

### Auth (minimal)
Implement minimal protection for admin endpoints:
- Option A: HTTP basic auth using env var `ADMIN_PASSWORD`
- Option B: simple header token (env var)
Either is fine; document it.

### Data persistence
- SQLite is preferred for speed.
- ORM is optional (Prisma/Sequelize/Knex/etc.). You may use raw queries if clean and safe.

## Non-functional requirements
- Input validation for create/update.
- Sensible error responses (JSON) for API.
- No secrets committed; include `.env.example`.

## Tests (minimum)
- At least 3 API tests covering:
  1) create intake (happy path)
  2) create intake (validation fail)
  3) protected route requires auth

## Suggested tech (not mandatory)
- Backend: Express or Fastify
- Frontend: Vite React, Next.js, or server-rendered
- DB: SQLite

## Acceptance criteria
- A reviewer can:
  - submit an intake
  - see it classified
  - view it in admin list
  - filter list
  - update status/notes
- The app runs locally via README steps.

## What we score highly
- Clean API and schema
- Thoughtful heuristic rules
- Minimal but real tests
- Clear README and AI appendix


## Soft cap reminder
Stop at 2 hours. If incomplete, document next steps in README under `What I would do next (and why)`.
