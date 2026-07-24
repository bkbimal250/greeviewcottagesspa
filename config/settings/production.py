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

if not AWS_STORAGE_BUCKET_NAME:  # noqa: F405
    raise ImproperlyConfigured("Set AWS_STORAGE_BUCKET_NAME for production media storage.")

AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = env.bool("AWS_QUERYSTRING_AUTH", default=False)  # noqa: F405
AWS_S3_FILE_OVERWRITE = env.bool("AWS_S3_FILE_OVERWRITE", default=False)  # noqa: F405
AWS_LOCATION = env("AWS_LOCATION", default="media")  # noqa: F405
AWS_S3_OBJECT_PARAMETERS = {
    "CacheControl": IMAGE_S3_CACHE_CONTROL,  # noqa: F405
}

if AWS_S3_CUSTOM_DOMAIN:  # noqa: F405
    s3_custom_domain = (
        AWS_S3_CUSTOM_DOMAIN.rstrip("/").removeprefix("https://").removeprefix("http://")
    )  # noqa: F405
    MEDIA_URL = f"https://{s3_custom_domain}/{AWS_LOCATION}/"  # noqa: F405
elif AWS_S3_REGION_NAME:  # noqa: F405
    MEDIA_URL = (  # noqa: F405
        f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/"
        f"{AWS_LOCATION}/"
    )
else:
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{AWS_LOCATION}/"  # noqa: F405

STORAGES = {  # noqa: F405
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

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
