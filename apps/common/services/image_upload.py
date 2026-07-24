from __future__ import annotations

import logging
from io import BytesIO
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
IMAGE_TYPE_DIRECTORY_MAP = {
    "thumbnail": "thumbnail",
    "cover": "cover",
    "logo": "logo",
    "gallery": "gallery",
    "exterior": "exterior",
    "exteriors": "exterior",
    "interior": "interior",
    "interiors": "interior",
    "reception": "reception",
    "garden": "garden",
    "common_area": "common-area",
    "common-area": "common-area",
    "bed": "bed",
    "beds": "bed",
    "bathroom": "bathroom",
    "bathrooms": "bathroom",
}


class LocalMediaImageUploadService:
    def __init__(self) -> None:
        self.max_size_bytes = getattr(settings, "IMAGE_UPLOAD_MAX_SIZE_BYTES", 10 * 1024 * 1024)
        self.max_width = getattr(settings, "IMAGE_MAX_WIDTH", 2000)
        self.max_height = getattr(settings, "IMAGE_MAX_HEIGHT", 2000)
        self.webp_quality = getattr(settings, "IMAGE_WEBP_QUALITY", 82)
        self.webp_method = getattr(settings, "IMAGE_WEBP_METHOD", 6)

    def validate_image(self, image_file: Any) -> None:
        if not image_file:
            raise ValidationError("No image file was provided.")

        current_position = image_file.tell()
        image_file.seek(0)

        try:
            file_size = getattr(image_file, "size", None)
            if file_size is None:
                file_size = len(image_file.read())
                image_file.seek(0)
            if file_size and file_size > self.max_size_bytes:
                raise ValidationError("Image exceeds the maximum allowed size.")

            with Image.open(image_file) as img:
                if img.format is None:
                    raise ValidationError("Unsupported or corrupted image file.")

                image_format = img.format.upper()
                if image_format == "JPG":
                    image_format = "JPEG"

                if image_format not in ALLOWED_IMAGE_FORMATS:
                    raise ValidationError("Unsupported image format.")

                img.load()
                ImageOps.exif_transpose(img)
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValidationError("Image file is corrupted or invalid.") from exc
        finally:
            image_file.seek(current_position)

    def process_image(self, image_file: Any) -> tuple[BytesIO, str]:
        self.validate_image(image_file)

        current_position = image_file.tell()
        image_file.seek(0)

        try:
            with Image.open(image_file) as img:
                img = ImageOps.exif_transpose(img)
                img.load()

                if img.mode in {"RGBA", "LA", "P"}:
                    output_mode = "RGBA"
                    processed = img.convert("RGBA")
                else:
                    output_mode = "RGB"
                    processed = img.convert("RGB")

                width, height = processed.size
                if width > self.max_width or height > self.max_height:
                    ratio = min(self.max_width / width, self.max_height / height)
                    if ratio < 1:
                        new_width = max(1, int(width * ratio))
                        new_height = max(1, int(height * ratio))
                        processed = processed.resize((new_width, new_height), Image.Resampling.LANCZOS)

                output = BytesIO()
                save_kwargs: dict[str, Any] = {
                    "format": "WEBP",
                    "quality": self.webp_quality,
                    "optimize": True,
                    "method": self.webp_method,
                }
                if output_mode == "RGBA":
                    save_kwargs["lossless"] = True
                processed.save(output, **save_kwargs)
                output.seek(0)
                return output, f"{uuid4().hex}.webp"
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise ValidationError("Unable to process image.") from exc
        finally:
            image_file.seek(current_position)

    def build_object_key(
        self,
        *,
        property_id: str | int,
        image_type: str,
        filename: str,
        cottage_id: str | int | None = None,
    ) -> str:
        safe_property_id = str(property_id).strip()
        safe_image_type = IMAGE_TYPE_DIRECTORY_MAP.get(image_type, image_type.lower())
        safe_image_type = safe_image_type.replace(" ", "-")
        safe_image_type = safe_image_type.strip("/")

        parts = ["properties", safe_property_id]
        if cottage_id is not None:
            parts.extend(["cottages", str(cottage_id).strip()])
        parts.append(safe_image_type)
        parts.append(filename)
        return "/".join(parts)

    def build_public_url(self, key: str) -> str:
        if not key:
            return ""
        if key.startswith(("http://", "https://")):
            return key

        media_url = getattr(settings, "MEDIA_URL", "/media/")
        return f"{media_url.rstrip('/')}/{key.lstrip('/')}"

    def upload_image(
        self,
        *,
        image_file: Any,
        property_id: str | int,
        image_type: str,
        cottage_id: str | int | None = None,
    ) -> dict[str, str]:
        processed_file, filename = self.process_image(image_file)
        key = self.build_object_key(
            property_id=property_id,
            image_type=image_type,
            filename=filename,
            cottage_id=cottage_id,
        )

        try:
            saved_key = default_storage.save(key, ContentFile(processed_file.getvalue()))
        except Exception as exc:
            logger.exception("Local image upload failed for key %s", key)
            raise ValidationError("Unable to upload image.") from exc

        return {
            "key": saved_key,
            "url": self.build_public_url(saved_key),
        }

    def delete_object(self, reference: str | None) -> None:
        if not reference:
            return

        if reference.startswith(("http://", "https://")):
            parsed = urlparse(reference)
            logical_key = parsed.path.lstrip("/")
        else:
            logical_key = reference

        if not logical_key.startswith("properties/"):
            return

        try:
            if default_storage.exists(logical_key):
                default_storage.delete(logical_key)
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.warning("Failed to delete local media object %s", logical_key, exc_info=exc)

    def get_image_url(self, reference: str | None) -> str:
        if not reference:
            return ""
        if reference.startswith(("http://", "https://")):
            return reference
        return self.build_public_url(reference)


image_upload_service = LocalMediaImageUploadService()


def upload_image_to_media(*args: Any, **kwargs: Any) -> dict[str, str]:
    return image_upload_service.upload_image(*args, **kwargs)


def delete_media_image(reference: str | None) -> None:
    image_upload_service.delete_object(reference)


def get_image_url(reference: str | None) -> str:
    return image_upload_service.get_image_url(reference)
