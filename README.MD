# Jharkhand Societal Innovation Collaboration Portal

A web application designed to connect citizens, communities, Panchayati Raj Institutions (PRIs), Urban Local Bodies (ULBs), Higher Education Institutions (HEIs), and industry partners to report, triage, and solve societal challenges in Jharkhand.

---

## Architecture Overview

- **`apps/web`**: Next.js 15 App Router + TypeScript + Tailwind CSS (Inter font, responsive two-density UI)
- **`apps/api`**: FastAPI (Python 3.11+) + SQLAlchemy (SQLite) + Scikit-Learn AI triage module

---

## Local Setup & Development

### 1. Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- virtualenv or venv

### 2. Configure Environment

Copy `.ENV.EXAMPLE` to `.env` in the project root:

```bash
cp .ENV.EXAMPLE .env
```

### 3. Start API Service (`apps/api`)

```bash
cd apps/api

# Create virtual environment (first time)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

API will be running at `http://localhost:8000`. Test endpoint: `http://localhost:8000/api/health`.

### 4. Start Web Service (`apps/web`)

In a new terminal tab:

```bash
cd apps/web

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```

Web frontend will be accessible at `http://localhost:3000`. Frontend API requests to `/api/*` are automatically proxied to `:8000`.

---

## Seed Users (Demo Accounts)

| Role | Email | Password | UI Density |
|---|---|---|---|
| Citizen | `citizen@demo` | `demo1234` | Simple |
| PRI / Local Body | `pri@demo` | `demo1234` | Simple |
| University / HEI | `uni@demo` | `demo1234` | Detailed |
| Industry / CSR | `industry@demo` | `demo1234` | Detailed |
| Govt Official | `govt@demo` | `demo1234` | Detailed |

---

## Project Documentation

Detailed specs and rules live in the `docs/` folder:
- [PRD](docs/PRD.MD)
- [Architecture](docs/ARCHITECTURE.MD)
- [Design System](docs/DESIGN.MD)
- [Security](docs/SECURITY.MD)
- [Test Plan](docs/TEST_PLAN.MD)
- [Development Rules](RULES.MD)
- [Task List](TASKS.md)
