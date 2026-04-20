FROM mcr.microsoft.com/vscode/devcontainers/python:0-3.11

# System deps for WeasyPrint + psycopg
RUN rm -f /etc/apt/sources.list.d/yarn.list && apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libffi-dev \
    libcairo2 \
    libglib2.0-0 \
    shared-mime-info \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY . .

RUN chmod +x /app/entrypoint.py

EXPOSE 8000

CMD ["python", "/app/entrypoint.py"]
