"""API v1 router — aggregates all endpoint modules."""

from fastapi import APIRouter

from app.api.v1 import sessions, search, usecases, scoring, export, detect_sector

api_router = APIRouter()

api_router.include_router(sessions.router, prefix="/session", tags=["sessions"])
api_router.include_router(scoring.router, prefix="/score", tags=["scoring"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(usecases.router, prefix="/usecases", tags=["usecases"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
api_router.include_router(detect_sector.router, tags=["detect-sector"])
