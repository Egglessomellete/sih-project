# Development Rules

## General

- Use TypeScript on the web app; Python 3.11+ type hints on the API.
- Reuse existing components.
- Do not duplicate logic (shared ticket status maps, domain enums live in one place per language).
- Keep functions small.
- Do not modify unrelated files.
- Read `prd.md`, `ARCHITECTURE.md`, `design.md` before building a feature.
- Hindi copy and English copy stay in sync for citizen screens.

## Before coding

- Read the relevant project documentation.
- Inspect existing implementation.
- Reuse existing functionality where possible.
- Make a plan for large changes.
- Prefer completing a `tasks.md` checkbox over adding scope.

## Product rules (this repo)

- **No junkyard:** do not list raw submissions without status, owner, or AI triage.
- **Ticket is source of truth.** Every accepted submission has a ticket ID.
- **Never auto-close** tickets. Close only after feedback or recorded official escalation + citizen confirm.
- **Two UI densities.** Role `citizen` | `community_org` | `pri` | `ulb` → simple. `university` | `industry` | `govt` → detailed.
- **Elderly-first citizen UI:** large type, one primary action, Help tour, no hover-only controls.
- **Routing is expertise-based**, not a public dump of all tickets to all solvers.
- **Official portals:** escalate via packet + links (SPGRMS, CPGRAMS/PMO, IPGRS, PGMS). Do not scrape government sites.
- **Out of scope stays out:** payments, AI tutor, native app, social feed.

## UI

- Follow `design.md`.
- Colors: Primary `#dccede`, Background `#f7f2f3`, Text `#201D1D`, Muted `#7F839F`.
- Primary button text is dark, never white on `#dccede`.
- Card radius 12px.
- Maintain responsive design.
- Include loading, error, and empty states.
- Accessible forms (labels, focus, errors).
- Motion.dev / React Bits only if they do not harm accessibility; citizen flows stay plain.

## API and AI

- Classify on submit; persist scores and explanations JSON.
- Evidence validation and information extraction run before routing.
- Dedup suggests merge; humans confirm; never silent-delete.
- Model artifacts and seed data are versioned; record `model_version` on each analysis.

## Security

- Never expose API keys.
- Validate user input (length, file type, GPS bounds for Jharkhand-ish box, MIME).
- Verify authorization server-side on every mutation.
- Do not trust `ui_density` or role from the client body; use JWT.
- Mask phone numbers in public/solver list views.
- Limit upload size; store outside the web root if possible.

## Testing

- Add tests for important functionality (authz, ticket state machine, classify mapping).
- Run tests after implementation.
- Fix failing tests before continuing.

## Git

- Make small commits.
- Use descriptive commit messages.
- Do not commit secrets, large videos, or `.env`.
- Do not commit unless the user asks.

## Files and docs

- Keep `prd.md` / `tasks.md` updated when a feature is accepted.
- New UI components go in `apps/web` shared UI; do not copy-paste card styles.
