from django.core.exceptions import ValidationError
from PIL import Image

ALLOWED_IMAGE_TYPES = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def validate_image_file(image) -> None:
    if image.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError("Image size must not exceed 5 MB.")

    current_position = image.tell()
    try:
        image.seek(0)
        with Image.open(image) as img:
            if img.format not in ALLOWED_IMAGE_TYPES:
                raise ValidationError("Only JPEG, PNG and WEBP images are allowed.")
    finally:
        image.seek(current_position)
