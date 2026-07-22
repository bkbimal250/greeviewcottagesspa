import re
from datetime import date
from pathlib import Path
from typing import Any

from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string
from django.utils.text import slugify


def unique_slug(value: str, model_class: type, slug_field: str = "slug") -> str:
    base_slug = slugify(value)[:80] or get_random_string(8).lower()
    slug = base_slug
    counter = 2
    while model_class.objects.filter(**{slug_field: slug}).exists():
        suffix = f"-{counter}"
        slug = f"{base_slug[: 100 - len(suffix)]}{suffix}"
        counter += 1
    return slug


def normalize_phone_number(phone: str, country_code: str = "+91") -> str:
    digits = re.sub(r"\D", "", phone or "")
    country_digits = re.sub(r"\D", "", country_code or "")
    if not digits:
        raise ValidationError("Phone number is required.")
    if digits.startswith(country_digits):
        return f"+{digits}"
    if len(digits) == 10 and country_digits:
        return f"+{country_digits}{digits}"
    return f"+{digits}"


def validate_date_range(check_in: date, check_out: date) -> None:
    today = date.today()
    if check_in < today:
        raise ValidationError("Check-in date cannot be in the past.")
    if check_out <= check_in:
        raise ValidationError("Check-out date must be after check-in date.")


def generate_reference(prefix: str = "GVC", length: int = 8) -> str:
    return f"{prefix}-{get_random_string(length).upper()}"


def image_upload_path(instance: Any, filename: str, folder: str) -> str:
    extension = Path(filename).suffix.lower()
    return f"{folder}/{instance.id}/{get_random_string(12)}{extension}"
