"""Structured logger for AI Radar DXC."""

import logging
import json
import sys
from datetime import datetime, timezone

from app.config import settings

_EXTRA_KEYS = (
    "model", "task", "tokens", "cache_hit", "latency_ms",
    "endpoint", "session_id", "duration_ms", "environment",
    "use_case_id", "sector",
)


class JSONFormatter(logging.Formatter):
    """Outputs log records as JSON lines (production mode)."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in _EXTRA_KEYS:
            val = getattr(record, key, None)
            if val is not None:
                log_data[key] = val
        return json.dumps(log_data)


class DevFormatter(logging.Formatter):
    """Human-readable format for development."""

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.now().strftime("%H:%M:%S")
        extras = []
        for key in _EXTRA_KEYS:
            val = getattr(record, key, None)
            if val is not None:
                extras.append(f"{key}={val}")
        extra_str = f" [{', '.join(extras)}]" if extras else ""
        return f"{ts} | {record.levelname:<7} | {record.name} | {record.getMessage()}{extra_str}"


def get_logger(name: str) -> logging.Logger:
    """Get a structured logger. JSON in production, human-readable in dev."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        if settings.ENVIRONMENT == "production":
            handler.setFormatter(JSONFormatter())
        else:
            handler.setFormatter(DevFormatter())
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    return logger
