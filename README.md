# Hotel Green View Cottages Backend

Phase 1 sets up the Django REST Framework backend foundation for Hotel Green View Cottages.

## Included in Phase 1

- Split Django settings: `base`, `development`, `production`
- PostgreSQL configuration through `DATABASE_URL`
- Redis cache and Celery broker/result backend configuration
- Docker Compose services for web, PostgreSQL, Redis, Celery worker and Celery beat
- Custom admin/staff user model with email login
- JWT login, refresh, logout and profile endpoints
- Common UUID base model, API response helpers and exception handler
- Swagger, ReDoc and OpenAPI schema endpoints
- Ruff, Black and pytest configuration

## Local Setup

Create and activate a virtual environment, then install development dependencies:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements/development.txt
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

For local development without Docker, update the `POSTGRES_*` and `REDIS_URL` values in `.env` so they point to your PostgreSQL and Redis services.

Run migrations and create the first admin user:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Docker Setup

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Docker uses the PostgreSQL settings from `.env`, so it can connect to either the bundled PostgreSQL container with `POSTGRES_HOST=db` or an external PostgreSQL host.

The API will be available at:

- Health check: `http://localhost:8000/api/health/`
- API root/admin: `http://localhost:8000/admin/`
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI schema: `http://localhost:8000/api/schema/`

## Auth Endpoints

- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/request-otp/`
- `POST /api/v1/auth/verify-otp/`
- `POST /api/v1/auth/token/refresh/`
- `POST /api/v1/auth/logout/`
- `GET /api/v1/auth/profile/`
- `PATCH /api/v1/auth/profile/`

Password login accepts email or phone:

```json
{
  "identifier": "admin@example.com",
  "password": "your-password"
}
```

OTP request body:

```json
{
  "identifier": "admin@example.com"
}
```

OTP verification body:

```json
{
  "identifier": "admin@example.com",
  "otp": "123456"
}
```

Phone identifiers are normalized to Indian numbers by default, so `9876543210` becomes `+919876543210`.

## Quality Checks

```powershell
ruff check .
black --check .
pytest
```

## Initial Migration Commands

```powershell
python manage.py makemigrations accounts
python manage.py migrate
```

When using Docker, run management commands inside the web container:

```powershell
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

Phase 2 should add the property model, serializers, public/admin APIs and property caching.

# greeviewcottagesspa
