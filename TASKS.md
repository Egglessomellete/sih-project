# Tasks

## TASK-001 — Project documentation
- [x] Write `prd.md`, `ARCHITECTURE.md`, `design.md`, `rules.md`, `tasks.md`

## Phase 1: Setup
- [x] Use existing `sih-project` git repo (not a second home-folder clone)
- [x] Add product docs
- [x] Scaffold `apps/web` (Next.js + TypeScript + Tailwind + Inter)
- [x] Scaffold `apps/api` (FastAPI + SQLAlchemy + SQLite)
- [x] Shared domain enums (roles, ticket statuses, domains)
- [x] README: how to run web + API locally

## Phase 2: Authentication
- [x] Create signup page (citizen: short form)
- [x] Create signup page (institution/solver: detailed org + expertise)
- [x] Create login page (simple, large controls)
- [x] Configure JWT authentication
- [x] Protect dashboard and ticket routes
- [x] Seed demo users
- [x] Test authentication and role isolation

## Phase 3: Help and tutorial
- [x] First-login tutorial (citizen: submit → dashboard → ticket)
- [x] Persistent Help button to replay tour
- [x] हिंदी | English toggle on citizen chrome
- [x] Empty/error/loading patterns as shared components

## Phase 4: Problem submission
- [x] Problem submission tab (text, photos, video, document, map/district)
- [x] Client validation + accessible errors
- [x] Upload API and `uploads/` storage
- [x] Save draft vs submit

## Phase 5: AI analysis algorithm
- [x] Evidence validation
- [x] Information extraction
- [x] Domain classification (Hindi+English)
- [x] Severity and priority
- [x] Near-duplicate detection
- [x] University / expertise routing
- [x] Persist analysis + explanations
- [x] `/classify` playground (solver/govt)
- [x] Seed labeled examples + train script

## Phase 6: Tickets
- [x] Create ticket after AI process (human-readable ID)
- [x] Ticket list tab: open vs closed vs in progress
- [x] Ticket detail: status, analysis, media, people
- [x] Citizen can always see “what happened”
- [x] State machine: no silent close

## Phase 7: Dashboard
- [x] Citizen dashboard: my pending / solved
- [x] Solver dashboard: assigned + matching expertise
- [x] Govt dashboard: counts pending vs solved (simple MVP charts)

## Phase 8: Problem acceptance
- [x] Acceptance page for HEI/govt (accept, reject, reassign, duplicate)
- [x] Expertise-based inbox (userbase 2)
- [x] Optional industry “offer help” on accepted tickets (thin)

## Phase 9: Feedback loop and close
- [x] Solver claims fix → ticket `pending_feedback`
- [x] Citizen/PRI: solved?, how well, comment
- [x] Close ticket only after feedback (or confirmed escalation)
- [x] Escalation packet + links (SPGRMS, PMO/CPGRAMS, IPGRS, PGMS)

## Phase 10: MVP hardening
- [x] Mobile responsive pass (citizen flow)
- [x] Loading / empty / error on every list
- [x] Basic API tests (authz + ticket transitions)
- [x] Demo seed problems (Hindi water scarcity, etc.)
- [x] 5-minute demo script in README
