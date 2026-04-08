#!/usr/bin/env python
"""Run database migrations and start the backend server."""
import subprocess
import sys
import os

# Set working directory
os.chdir('/app')

# Run migrations
print("Running database migrations...")
result = subprocess.run([
    sys.executable, '-m', 'alembic', '-c', 'alembic/alembic.ini', 'upgrade', 'head'
], cwd='/app')

if result.returncode != 0:
    print("Warning: Migrations may have already been applied or failed")

# Start Uvicorn
print("Starting Uvicorn...")
os.execvp(sys.executable, [
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', '8000',
    '--reload'
])
