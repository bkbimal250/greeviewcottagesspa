from django.db import connection
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.views import APIView

from apps.common.cache import safe_cache_get, safe_cache_set
from apps.common.responses import success_response


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        tags=["Health"],
        responses={
            200: OpenApiResponse(description="Service health status."),
        },
    )
    def get(self, request, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        cache_ok = safe_cache_set("health-check", "ok", timeout=10)
        cache_status = "ok" if cache_ok and safe_cache_get("health-check") == "ok" else "degraded"

        return success_response(
            data={"database": "ok", "cache": cache_status},
            message="Service is healthy.",
        )
