import logging
from typing import Any

from django.core.cache import cache

logger = logging.getLogger(__name__)


def safe_cache_get(key: str, default: Any = None) -> Any:
    try:
        return cache.get(key, default)
    except Exception as exc:
        logger.warning("Cache get failed for %s: %s", key, exc)
        return default


def safe_cache_set(key: str, value: Any, timeout: int | None = None) -> bool:
    try:
        return bool(cache.set(key, value, timeout=timeout))
    except Exception as exc:
        logger.warning("Cache set failed for %s: %s", key, exc)
        return False


def safe_cache_delete(key: str) -> bool:
    try:
        return bool(cache.delete(key))
    except Exception as exc:
        logger.warning("Cache delete failed for %s: %s", key, exc)
        return False
