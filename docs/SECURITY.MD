# Security notes (MVP)

- JWT secret from environment (`JWT_SECRET`). Never commit `.env`.
- Role and UI density come from the token, not the request body.
- Validate uploads (size, MIME). Store under `uploads/` outside the Next.js public folder.
- Mask phone-like strings in public ticket summaries.
- No scraping of government grievance portals.
