#!/bin/bash
set -e

# Run migrations
echo "Running database migrations..."
cd /app/alembic
python -m alembic upgrade head || true

# Start the application
echo "Starting Uvicorn..."
cd /app
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
