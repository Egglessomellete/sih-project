"""
SIH Jharkhand Portal — FastAPI entry point.

Run: uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, health, tickets


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (SQLite auto-creates the file)."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

# --- CORS (allow Next.js dev server) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
