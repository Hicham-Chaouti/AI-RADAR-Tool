#!/usr/bin/env python
import asyncio
import sys
sys.path.insert(0, '/app')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import inspect
from app.models.database import Base
from app.config import settings

async def check_database():
    # Create engine and check tables
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"Tables in metadata: {list(Base.metadata.tables.keys())}")
    
    # Check if tables exist in database
    async with engine.begin() as conn:
        inspector = await conn.run_sync(inspect)
        db_tables = await conn.run_sync(lambda x: x.get_table_names())
        print(f"Tables in database: {db_tables}")
    
    await engine.dispose()

asyncio.run(check_database())
