import logging
from typing import Any

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.views import exception_handler

from apps.common.responses import error_response

logger = logging.getLogger(__name__)


def _flatten_message(detail: Any) -> str:
    if isinstance(detail, dict):
        first_value = next(iter(detail.values()), None)
        return _flatten_message(first_value) if first_value else "Validation error"
    if isinstance(detail, list):
        return _flatten_message(detail[0]) if detail else "Validation error"
    return str(detail) if detail else "Request failed"


def custom_exception_handler(exc: Exception, context: dict[str, Any]):
    if isinstance(exc, DjangoValidationError):
        return error_response(
            message="Validation error",
            errors=exc.message_dict if hasattr(exc, "message_dict") else exc.messages,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    response = exception_handler(exc, context)
    if response is None:
        if settings.DEBUG:
            raise exc
        view = context.get("view")
        request = context.get("request")
        logger.exception(
            "Unhandled API exception in %s %s",
            view.__class__.__name__ if view else "unknown view",
            request.path if request else "unknown path",
        )
        return error_response(
            message="Internal server error",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data
    message = _flatten_message(detail)
    errors = detail
    if isinstance(detail, dict) and "detail" in detail and len(detail) == 1:
        errors = {}

    return error_response(
        message=message,
        errors=errors,
        status_code=response.status_code,
    )
