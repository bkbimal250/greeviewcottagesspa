from .base import *  # noqa: F403

DEBUG = True
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0

EMAIL_BACKEND = env(  # noqa: F405
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)

ALLOWED_HOSTS = list(set(ALLOWED_HOSTS + ["localhost", "127.0.0.1", "testserver"]))  # noqa: F405

if not env.bool("USE_REDIS_CACHE", default=False):  # noqa: F405
    CACHES = {  # noqa: F405
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "greenview-development-cache",
        }
    }

if not env.bool("USE_REDIS_CHANNEL_LAYER", default=False):  # noqa: F405
    CHANNEL_LAYERS = {  # noqa: F405
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }

if not env.bool("USE_REDIS_CELERY", default=False):  # noqa: F405
    CELERY_BROKER_URL = "memory://"  # noqa: F405
    CELERY_RESULT_BACKEND = ""  # noqa: F405
    CELERY_TASK_IGNORE_RESULT = True  # noqa: F405
