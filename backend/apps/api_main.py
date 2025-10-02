# main.py

from __future__ import annotations
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware
from app.core.db import engine
from app import models
# Routers
from app.api.v1.prestashop import router as prestashop_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.health import router as health_router
from app.api.v1.runs import router as runs_router

setup_logging()

app = FastAPI(title="Watchdogs API", version="0.1.0")
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Create database
@app.on_event("startup")
async def on_startup():
    models.Base.metadata.create_all(bind=engine)

# Register routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(prestashop_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(runs_router, prefix="/api/v1")
