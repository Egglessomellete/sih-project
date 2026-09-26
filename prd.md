# Product Requirements Document

## Product

Jharkhand Societal Innovation Collaboration Portal — a **web app** with the **simplest possible UI** so citizens, including aged and elderly users, can submit a local problem without training.

Two interface densities, same product:

- **Citizen / community mode:** large type, short labels, one primary action per screen, Hindi+English, persistent Help.
- **Institution / solver mode:** denser tables, expertise filters, routing, proposals, tickets, analytics.

This is an **MVP**. No native mobile app, no payments, no social feed, no AI tutor.

## Problem

Citizens and communities are often first to see issues in education, healthcare, agriculture, water, sanitation, environment, livelihoods, accessibility, urban infrastructure, and public services. There is **no structured path** from that observation to evaluation and innovation-driven resolution.

At the same time, Higher Education Institutions (HEIs) have faculty, students, and research capacity, and industry / startups / MSMEs / CSR / labs have skills, capital, and implementation capacity. Collaboration today is **fragmented and project-specific**.

Existing helplines and grievance sites fail many people because of:

- Inability to use helplines or low awareness
- Difficulty giving **enough detail** for an **actionable** grievance
- Intimidation when speaking to officials
- Hard-to-track registered grievances
- Low operator accountability
- Portals that become a **junkyard of problem statements** (e.g. dump-and-forget experiences like poorly triaged public portals)

This product must **not** become another junkyard: every submission becomes a **ticket**, is **classified and quality-gated**, is **routed to people who can act**, stays **open until solved**, and **closes only after citizen feedback**.

## Target audience

**Userbase 1 — reporters**

- Citizens (including elderly)
- Community organizations
- Local bodies (PRI / ULB)
- Government agencies

**Userbase 2 — solvers**

- Universities / HEIs, faculty, students (projects, experiential learning)
- Industry partners, startups, MSMEs, CSR, research labs, innovation hubs

**Escalation (not a replacement for official grievance systems)**

When a case is a **service grievance** rather than an **innovation challenge**, or when a challenge needs a government ticket as well, the platform prepares an **escalation packet** and points the user to official channels, including:

- SPGRMS (state public grievance)
- PMO / CPGRAMS-style central grievance
- IPGRS
- PGMS / PGMRS-style departmental systems

MVP does **not** auto-file into those systems (no unofficial scraping). It **packages** title, facts extracted by AI, media, location, ticket ID, and a copy-ready summary plus official links.

## Goal

One **central portal** that connects reporters and solvers so problems are **worked**, not archived.

Success is: structured intake → AI triage → human acceptance → university/industry work **or** official escalation → **closed-loop feedback**. Failure is an unfiltered list of complaints with no owner.

## Core features

1. **Authentication**
   - Citizen/community: very basic, understandable signup/login (phone or email + password for MVP).
   - Institution/solver/researcher: **detailed** profile (org, role, disciplines, incubation, CSR, expertise tags) so routing works.
2. **Dashboard**
   - Pending vs solved (and in-progress) problems for the logged-in role.
   - Citizen sees *my tickets*. Solver sees *assigned / matching expertise*. Govt sees *queue + analytics*.
3. **Ticket method**
   - Submit → AI process → ticket created → stays open until solved (and feedback collected).
4. **AI problem management**
   - Domain classification, priority, severity, near-duplicates, university routing
   - Evidence validation (enough text, location, media quality/presence)
   - Information extraction (location phrases, people affected, hazard/domain keywords)
   - Categorisation
   - Then a **ticket is raised**; not closed until resolved + feedback
5. **Closed feedback loop**
   - After a claimed fix: ask via the ticket whether it is solved, how well, and simple metrics (resolved yes/no, 1–5 quality, comment).
6. **Help button**
   - First login: short tutorial on how to use the app.
   - Persistent Help control to replay the tour anytime.

## MVP

- Signup and login pages (two densities)
- Dashboard of pending / solved
- Problem submission (text, photo, video URL or file, document, location)
- Ticket open / closed (and in-between statuses) tab
- Analysis algorithm (AI module above)
- Problem acceptance page (HEI/govt accept, reject, reassign, mark duplicate)
- Tutorial plus Help button

## Out of scope (MVP)

- Payments
- AI tutor
- Native mobile app (responsive web only)
- Social feed
- Live government grievance APIs
- Patent office workflow, CSR payments, fluff

## Success criteria

A user should be able to:

1. Create an account
2. Log in
3. Submit a problem with multimedia (picture, video, document, text, location)
4. See what happened — solved or not (ticket status)
5. Review the outcome and give feedback at the end
6. Userbase 2 sees problems matching their expertise and can receive routed problems
7. Raise a ticket and close it only after solution + feedback (or documented escalation)

## Ticket lifecycle (source of truth)

`draft → submitted → ai_processed → needs_info | duplicate_review → under_review → accepted → in_progress → pending_feedback → closed`  
Also: `rejected`, `escalated_official` (still may stay open until citizen confirms).

**Rule:** the system never silently closes a ticket. Solver marks *fix claimed*; citizen (or PRI) confirms.

## Language and accessibility

Hindi and English labels on citizen flows. Minimum 16px body text in citizen mode, high contrast against `#f7f2f3`, visible focus rings, no hover-only actions.
