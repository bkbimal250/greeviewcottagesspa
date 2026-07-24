from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

SECRET_KEY = env("DJANGO_SECRET_KEY", default="")  # noqa: F405
if not SECRET_KEY:
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY for production.")

ALLOWED_HOSTS = env(  # noqa: F405
    "DJANGO_ALLOWED_HOSTS",
    default=[
        "api.backend.greencottagesandspa.in",
        "127.0.0.1",
        "localhost",
    ],
)
CSRF_TRUSTED_ORIGINS = env(  # noqa: F405
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default=[
        "https://api.backend.greencottagesandspa.in",
        "https://greencottagesandspa.in",
        "https://www.greencottagesandspa.in",
        "https://booking.greencottagesandspa.in",
    ],
)
CORS_ALLOWED_ORIGINS = env(  # noqa: F405
    "CORS_ALLOWED_ORIGINS",
    default=[
        "https://greencottagesandspa.in",
        "https://www.greencottagesandspa.in",
        "https://booking.greencottagesandspa.in",
    ],
)
CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=True)  # noqa: F405

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)  # noqa: F405
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=True)  # noqa: F405
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=True)  # noqa: F405
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)  # noqa: F405
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(  # noqa: F405
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=True,
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=True)  # noqa: F405
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = env("SESSION_COOKIE_SAMESITE", default="Lax")  # noqa: F405
CSRF_COOKIE_SAMESITE = env("CSRF_COOKIE_SAMESITE", default="Lax")  # noqa: F405

MEDIA_URL = env("MEDIA_URL", default="/media/")  # noqa: F405
MEDIA_ROOT = env.path("MEDIA_ROOT", default=BASE_DIR / "media")  # noqa: F405

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:  # noqa: F405
    raise ImproperlyConfigured("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for production.")

LOGGING["loggers"] = {  # noqa: F405
    "django": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },
    "django.request": {
        "handlers": ["console"],
        "level": "WARNING",
        "propagate": False,
    },
    "django.security": {
        "handlers": ["console"],
        "level": "WARNING",
        "propagate": False,
    },
    "gunicorn.error": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },
    "apps": {
        "handlers": ["console"],
        "level": "INFO",
        "propagate": False,
    },
}
