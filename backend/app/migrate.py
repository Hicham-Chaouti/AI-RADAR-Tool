#!/usr/bin/env python
"""Simple migration runner to create database tables."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.database import Base
from app.config import settings

async def run_migrations():
    """Create all tables defined in Base.metadata."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migrations())
