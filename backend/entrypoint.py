#!/usr/bin/env python
"""Run database migrations and start the backend server."""
import subprocess
import sys
import os
import time
import socket

# Set working directory
os.chdir('/app')


def wait_for_postgres(host='postgres', port=5432, timeout=30):
    """Wait until PostgreSQL is accepting connections."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=2):
                print(f"PostgreSQL is ready at {host}:{port}")
                return True
        except (ConnectionRefusedError, socket.timeout, OSError):
            print(f"Waiting for PostgreSQL at {host}:{port}...")
            time.sleep(2)
    print(f"ERROR: PostgreSQL not ready after {timeout}s")
    return False


# Wait for PostgreSQL
if not wait_for_postgres():
    sys.exit(1)

# Run migrations
print("Running database migrations...")
result = subprocess.run([
    sys.executable, '-m', 'alembic', '-c', 'alembic/alembic.ini', 'upgrade', 'head'
], cwd='/app')

if result.returncode != 0:
    print("ERROR: Database migrations failed!")
    sys.exit(1)

print("Migrations completed successfully")

# Start Uvicorn
print("Starting Uvicorn...")
os.execvp(sys.executable, [
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', '8000',
    '--reload'
])
