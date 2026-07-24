from io import BytesIO

from django.core.exceptions import ValidationError
from django.test import SimpleTestCase, override_settings
from PIL import Image

from apps.common.services.image_upload import LocalMediaImageUploadService


class PropertySetupTests(SimpleTestCase):
    pass


class LocalMediaImageUploadServiceTests(SimpleTestCase):
    def setUp(self):
        self.service = LocalMediaImageUploadService()

    def test_process_image_converts_jpeg_to_webp_and_uses_webp_extension(self):
        image_file = BytesIO()
        Image.new("RGB", (80, 60), color="red").save(image_file, format="JPEG")
        image_file.seek(0)

        processed_file, filename = self.service.process_image(image_file)

        self.assertTrue(filename.endswith(".webp"))
        processed_file.seek(0)
        with Image.open(processed_file) as processed_image:
            self.assertEqual(processed_image.format, "WEBP")

    def test_process_image_preserves_transparency_for_png(self):
        image_file = BytesIO()
        Image.new("RGBA", (20, 20), (255, 0, 0, 128)).save(image_file, format="PNG")
        image_file.seek(0)

        processed_file, _ = self.service.process_image(image_file)
        processed_file.seek(0)
        with Image.open(processed_file) as processed_image:
            self.assertEqual(processed_image.mode, "RGBA")

    def test_process_image_resizes_large_images_without_upscaling(self):
        image_file = BytesIO()
        Image.new("RGB", (4000, 3000), color="blue").save(image_file, format="JPEG")
        image_file.seek(0)

        with override_settings(IMAGE_MAX_WIDTH=2000, IMAGE_MAX_HEIGHT=2000):
            service = LocalMediaImageUploadService()
            processed_file, _ = service.process_image(image_file)
            processed_file.seek(0)
            with Image.open(processed_file) as processed_image:
                self.assertLessEqual(processed_image.width, 2000)
                self.assertLessEqual(processed_image.height, 2000)

    def test_process_image_rejects_invalid_image_format(self):
        image_file = BytesIO(b"not-an-image")
        with self.assertRaises(ValidationError):
            self.service.process_image(image_file)

    def test_build_object_key_includes_property_and_cottage_ids(self):
        key = self.service.build_object_key(
            property_id=12,
            image_type="cover",
            filename="abc123.webp",
            cottage_id=48,
        )

        self.assertEqual(key, "properties/12/cottages/48/cover/abc123.webp")

    def test_build_object_key_includes_property_id_for_property_images(self):
        key = self.service.build_object_key(
            property_id=12,
            image_type="gallery",
            filename="abc123.webp",
        )

        self.assertEqual(key, "properties/12/gallery/abc123.webp")
