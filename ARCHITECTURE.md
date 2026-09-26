# Architecture

## Decision (MVP)

**Best fit: split web UI + Python API.**

| Layer | Choice | Why |
| --- | --- | --- |
| UI | Next.js 15 App Router, TypeScript, Tailwind | Fast to ship; one responsive web app for elderly citizens and detailed solvers |
| API + tickets | FastAPI, SQLAlchemy | Clear REST; authz on server |
| AI | Same FastAPI process: scikit-learn + sentence-transformers (multilingual MiniLM) | Classification, embeddings, dedup must run in Python |
| DB | SQLite (Postgres-ready schema) | Zero-ops demo; file in repo for SIH |
| Auth | JWT + httpOnly cookie or bearer; role claims | Simple; no OAuth required for MVP |
| Files | Local `uploads/` | Photos, PDFs, short video; no S3 in MVP |
| Help | First-login flag + replayable tour | PRD Help button |

**Rejected for MVP**

- All-in on Next.js Route Handlers for AI — weak for sklearn/MiniLM and SIH “algorithm” story.
- Native apps — out of scope.
- Microservices / Kafka / Redis — overkill; one API process.
- Live SPGRMS/CPGRAMS APIs — not public/stable for a student MVP; use **escalation packet + official URLs**.

## High-level

```
Citizen / PRI / ULB / Govt / HEI / Industry
        │
        ▼
┌───────────────────┐     ┌─────────────────────────────┐
│  apps/web         │────▶│  apps/api (FastAPI)         │
│  Next.js          │     │  auth, tickets, uploads     │
│  citizen | solver │     │  classify pipeline          │
└───────────────────┘     │  notifications (in-app)     │
                          └─────────────┬───────────────┘
                                        │
                          ┌─────────────▼───────────────┐
                          │  SQLite + uploads/          │
                          └─────────────────────────────┘
```

Citizen screens call the same APIs as solver screens; **layout and copy** change with `ui_density` derived from role.

## Ticket-centric domain

A **Problem** is intake. A **Ticket** is the durable workflow object (ID like `JH-PAL-2026-0042`). AI writes a `TicketAnalysis` row. HEIs and industry attach **assignments**, **proposals**, **offers**. Closure requires **Feedback**.

Escalation: `EscalationPacket` JSON (extracted facts + media list + official portal name + URL). User copies or downloads; we store `escalated_at`.

## AI pipeline (sync on submit, <2s CPU target)

1. Normalize text (Hindi/English), mask phones in public views
2. Evidence validation — fail closed to `needs_info` if description too short, no district/geo, or no evidence when user claimed media
3. Information extraction — district, landmarks, population hints, hazard keywords
4. Embed — `paraphrase-multilingual-MiniLM-L12-v2` when installed; TF-IDF vector fallback so the demo always runs
5. Domain (TF-IDF+LogReg and keyword/embedding head; primary + secondary)
6. Severity and priority; queue score `0.6*severity + 0.4*urgency`
7. Near-dup cosine vs open tickets
8. University routing vs HEI expertise tags + load
9. Open ticket if validation passed (or open as `needs_info`)

Admin `/classify` playground for jury.

## AuthZ

Every mutating route checks role. Citizens mutate only own tickets (submit, feedback, messages). Solvers mutate assigned tickets. Govt can reassign and override priority.

## Folder layout

```
sih-project/
  prd.md
  ARCHITECTURE.md
  design.md
  rules.md
  tasks.md
  apps/web/          # Next.js
  apps/api/          # FastAPI
  data/seed/
  uploads/
```

## Runtime (local demo)

- `web` :3000 → proxies `/api` to FastAPI :8000
- Seed users: `citizen@demo`, `pri@demo`, `uni@demo`, `industry@demo`, `govt@demo` (password `demo1234`)

## Future (not MVP)

Postgres, object storage, WhatsApp/SMS, real grievance APIs, PWA install, queue worker if classify exceeds request timeout.
