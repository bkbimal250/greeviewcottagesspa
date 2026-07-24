from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    DJANGO_DEBUG=(bool, False),
    ALLOWED_HOSTS=(
        list,
        [
            "localhost",
            "127.0.0.1",
            "testserver",
            "greencottagesandspa.in",
            "booking.greencottagesandspa.in",
            "api.backend.greencottagesandspa.in",
        ],
    ),
    DJANGO_ALLOWED_HOSTS=(
        list,
        [
            "localhost",
            "127.0.0.1",
            "testserver",
            "api.backend.greencottagesandspa.in",
        ],
    ),
    CORS_ALLOWED_ORIGINS=(
        list,
        [
            "https://greencottagesandspa.in",
            "https://www.greencottagesandspa.in",
            "https://booking.greencottagesandspa.in",
        ],
    ),
    CSRF_TRUSTED_ORIGINS=(
        list,
        [
            "https://api.backend.greencottagesandspa.in",
            "https://greencottagesandspa.in",
            "https://www.greencottagesandspa.in",
            "https://booking.greencottagesandspa.in",
        ],
    ),
    DJANGO_CSRF_TRUSTED_ORIGINS=(
        list,
        [
            "https://api.backend.greencottagesandspa.in",
            "https://greencottagesandspa.in",
            "https://www.greencottagesandspa.in",
            "https://booking.greencottagesandspa.in",
        ],
    ),
    SECURE_SSL_REDIRECT=(bool, False),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default=env("SECRET_KEY", default="change-me-in-env"))
DEBUG = env.bool("DJANGO_DEBUG", default=env.bool("DEBUG", default=False))
ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS", default=env("ALLOWED_HOSTS"))

ADMIN_THEME_APPS = [
    "adminlte4",
    "adminlte4_theme",
]

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "channels",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "storages",
]

LOCAL_APPS = [
    "apps.common",
    "apps.accounts",
    "apps.properties",
    "apps.cottages",
    "apps.bookings",
    "apps.payments",
    "apps.notifications",
]

INSTALLED_APPS = ADMIN_THEME_APPS + ["daphne"] + DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


def database_config() -> dict:
    database_url = env("DATABASE_URL", default="")
    if database_url:
        return env.db("DATABASE_URL")

    database_type = env("DATABASE_TYPE", default="postgresql").lower()
    if database_type not in {"postgres", "postgresql"}:
        raise ValueError("Only PostgreSQL is supported for this project.")

    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DATABASE_NAME", default=env("POSTGRES_DB", default="green_view_cottages")),
        "USER": env("DATABASE_USER", default=env("POSTGRES_USER", default="postgres")),
        "PASSWORD": env("DATABASE_PASSWORD", default=env("POSTGRES_PASSWORD", default="")),
        "HOST": env("DATABASE_HOST", default=env("POSTGRES_HOST", default="localhost")),
        "PORT": env.int("DATABASE_PORT", default=env.int("POSTGRES_PORT", default=5432)),
        "OPTIONS": {
            "connect_timeout": env.int("DATABASE_CONNECT_TIMEOUT", default=10),
        },
    }


DATABASES = {"default": database_config()}
DATABASES["default"]["CONN_MAX_AGE"] = env.int("DATABASE_CONN_MAX_AGE", default=60)

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://localhost:6379/1"),
        "OPTIONS": {
            "socket_connect_timeout": env.float("REDIS_SOCKET_CONNECT_TIMEOUT", default=1.0),
            "socket_timeout": env.float("REDIS_SOCKET_TIMEOUT", default=1.0),
            "retry_on_timeout": False,
        },
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                env(
                    "CHANNEL_REDIS_URL",
                    default=env("REDIS_URL", default="redis://localhost:6379/2"),
                )
            ],
            "capacity": env.int("CHANNEL_LAYER_CAPACITY", default=1500),
            "expiry": env.int("CHANNEL_LAYER_EXPIRY", default=10),
        },
    }
}

CELERY_BROKER_URL = env(
    "CELERY_BROKER_URL", default=env("REDIS_URL", default="redis://localhost:6379/0")
)
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="")
CELERY_TASK_IGNORE_RESULT = env.bool("CELERY_TASK_IGNORE_RESULT", default=True)
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Asia/Kolkata"
CELERY_BROKER_CONNECTION_TIMEOUT = env.int("CELERY_BROKER_CONNECTION_TIMEOUT", default=3)
CELERY_TASK_PUBLISH_RETRY = env.bool("CELERY_TASK_PUBLISH_RETRY", default=False)
CELERY_BROKER_TRANSPORT_OPTIONS = {
    "socket_connect_timeout": env.float("REDIS_SOCKET_CONNECT_TIMEOUT", default=1.0),
    "socket_timeout": env.float("REDIS_SOCKET_TIMEOUT", default=1.0),
}
CELERY_RESULT_BACKEND_TRANSPORT_OPTIONS = CELERY_BROKER_TRANSPORT_OPTIONS

AUTH_USER_MODEL = "accounts.User"
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend"]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "apps.common.pagination.StandardResultsSetPagination",
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "EXCEPTION_HANDLER": "apps.common.exceptions.custom_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "availability": "60/hour",
        "auth_otp": "10/hour",
        "booking_create": "10/hour",
        "booking_lookup": "20/hour",
        "payment_create": "20/hour",
        "payment_confirm": "30/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

AUTH_OTP_LENGTH = env.int("AUTH_OTP_LENGTH", default=6)
AUTH_OTP_EXPIRY_MINUTES = env.int("AUTH_OTP_EXPIRY_MINUTES", default=10)
AUTH_OTP_MAX_ATTEMPTS = env.int("AUTH_OTP_MAX_ATTEMPTS", default=5)

SPECTACULAR_SETTINGS = {
    "TITLE": "Hotel Green View Cottages API",
    "DESCRIPTION": "Backend API for cottage availability, booking and administration.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "ENUM_NAME_OVERRIDES": {
        "BookingStatusEnum": [
            ("pending", "Pending"),
            ("confirmed", "Confirmed"),
            ("checked_in", "Checked In"),
            ("checked_out", "Checked Out"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
            ("no_show", "No Show"),
        ],
        "BookingPaymentStatusEnum": [
            ("unpaid", "Unpaid"),
            ("partially_paid", "Partially Paid"),
            ("paid", "Paid"),
            ("failed", "Failed"),
            ("refunded", "Refunded"),
        ],
        "BookingPaymentMethodEnum": [
            ("pay_at_property", "Pay at Property"),
            ("cash", "Cash"),
            ("upi", "UPI"),
            ("card", "Card"),
            ("bank_transfer", "Bank Transfer"),
            ("online_gateway", "Online Gateway"),
        ],
        "BookingCancellationStatusEnum": [
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        "PropertyStatusEnum": [
            ("draft", "Draft"),
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("temporarily_closed", "Temporarily Closed"),
        ],
        "CottageStatusEnum": [
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("maintenance", "Maintenance"),
            ("blocked", "Blocked"),
        ],
        "CottageAvailabilityHoldStatusEnum": [
            ("active", "Active"),
            ("released", "Released"),
            ("converted", "Converted to Booking"),
        ],
        "PaymentStatusEnum": [
            ("pending", "Pending"),
            ("successful", "Successful"),
            ("failed", "Failed"),
            ("refunded", "Refunded"),
        ],
        "PaymentProviderEnum": [
            ("manual", "Manual"),
            ("cash", "Cash"),
            ("upi", "UPI"),
            ("card", "Card"),
            ("bank_transfer", "Bank Transfer"),
            ("razorpay", "Razorpay"),
            ("online_gateway", "Online Gateway"),
        ],
        "PaymentOrderStatusEnum": [
            ("created", "Created"),
            ("attempted", "Attempted"),
            ("paid", "Paid"),
            ("failed", "Failed"),
            ("expired", "Expired"),
            ("cancelled", "Cancelled"),
        ],
        "PaymentOrderProviderEnum": [
            ("razorpay", "Razorpay"),
            ("upi_qr", "UPI QR"),
        ],
        "NotificationStatusEnum": [
            ("queued", "Queued"),
            ("sent", "Sent"),
            ("delivered", "Delivered"),
            ("read", "Read"),
            ("failed", "Failed"),
        ],
    },
}

HEALTH_CHECK_CACHE_KEY = "health-check"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY", default="")
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default="")
AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME", default="")
AWS_S3_CUSTOM_DOMAIN = env("AWS_S3_CUSTOM_DOMAIN", default="")
AWS_S3_ENDPOINT_URL = env("AWS_S3_ENDPOINT_URL", default="")
IMAGE_UPLOAD_MAX_SIZE_MB = env.int("IMAGE_UPLOAD_MAX_SIZE_MB", default=10)
IMAGE_UPLOAD_MAX_SIZE_BYTES = IMAGE_UPLOAD_MAX_SIZE_MB * 1024 * 1024
IMAGE_MAX_WIDTH = env.int("IMAGE_MAX_WIDTH", default=2000)
IMAGE_MAX_HEIGHT = env.int("IMAGE_MAX_HEIGHT", default=2000)
IMAGE_WEBP_QUALITY = env.int("IMAGE_WEBP_QUALITY", default=82)
IMAGE_WEBP_METHOD = env.int("IMAGE_WEBP_METHOD", default=6)
IMAGE_S3_CACHE_CONTROL = env(
    "IMAGE_S3_CACHE_CONTROL", default="public, max-age=31536000, immutable"
)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = env.bool("CORS_ALLOW_CREDENTIALS", default=True)
CSRF_TRUSTED_ORIGINS = env(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default=env("CSRF_TRUSTED_ORIGINS"),
)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = env("SESSION_COOKIE_SAMESITE", default="Lax")
CSRF_COOKIE_SAMESITE = env("CSRF_COOKIE_SAMESITE", default="Lax")

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="reservations@greenviewcottages.local")
ADMIN_NOTIFICATION_EMAIL = env("ADMIN_NOTIFICATION_EMAIL", default="")
ADMIN_NOTIFICATION_PHONE = env("ADMIN_NOTIFICATION_PHONE", default="")
ADMIN_NOTIFICATION_WHATSAPP = env(
    "ADMIN_NOTIFICATION_WHATSAPP",
    default=ADMIN_NOTIFICATION_PHONE,
)
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)

WHATSAPP_ACCESS_TOKEN = env("WHATSAPP_ACCESS_TOKEN", default="")
WHATSAPP_PHONE_NUMBER_ID = env("WHATSAPP_PHONE_NUMBER_ID", default="")
WHATSAPP_BUSINESS_ACCOUNT_ID = env("WHATSAPP_BUSINESS_ACCOUNT_ID", default="")
WHATSAPP_VERIFY_TOKEN = env("WHATSAPP_VERIFY_TOKEN", default="")
WHATSAPP_API_VERSION = env("WHATSAPP_API_VERSION", default="v20.0")

SMS_PROVIDER = env("SMS_PROVIDER", default="")
SMS_PROVIDER_URL = env("SMS_PROVIDER_URL", default="")
SMS_API_KEY = env("SMS_API_KEY", default="")
SMS_SENDER_ID = env("SMS_SENDER_ID", default="")

RAZORPAY_KEY_ID = env("RAZORPAY_KEY_ID", default="")
RAZORPAY_KEY_SECRET = env("RAZORPAY_KEY_SECRET", default="")
RAZORPAY_AUTO_CAPTURE = env.bool("RAZORPAY_AUTO_CAPTURE", default=True)
RAZORPAY_ORDER_EXPIRY_MINUTES = env.int("RAZORPAY_ORDER_EXPIRY_MINUTES", default=30)
UPI_PAYEE_VPA = env("UPI_PAYEE_VPA", default="")
UPI_PAYEE_NAME = env("UPI_PAYEE_NAME", default="Green View Cottages")

FRONTEND_URL = env("FRONTEND_URL", default="https://greencottagesandspa.in")
PROPERTY_DEFAULT_PHONE = env("PROPERTY_DEFAULT_PHONE", default="09784622826")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": (
                '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s",'
                '"message":"%(message)s"}'
            )
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        }
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
