from django.test import SimpleTestCase
from django.urls import reverse

from apps.properties.models import Property
from apps.properties.serializers import (
    PropertyAdminListSerializer,
    PropertyAdminSerializer,
    PropertyPublicSerializer,
)


class PropertySetupTests(SimpleTestCase):
    def test_property_routes_are_registered(self):
        property_obj = Property(name="Hotel Green View Cottages")

        self.assertEqual(reverse("properties:public-property"), "/api/v1/property/")
        self.assertEqual(reverse("properties:admin-property-list"), "/api/v1/admin/property/")
        self.assertEqual(
            reverse("properties:admin-property-detail", kwargs={"pk": property_obj.id}),
            f"/api/v1/admin/property/{property_obj.id}/",
        )
        self.assertEqual(
            reverse("properties:admin-property-upload-image", kwargs={"pk": property_obj.id}),
            f"/api/v1/admin/property/{property_obj.id}/upload-image/",
        )

    def test_public_serializer_does_not_expose_admin_notes(self):
        serializer = PropertyPublicSerializer()

        self.assertNotIn("admin_notes", serializer.fields)
        self.assertIn("full_address", serializer.fields)
        self.assertIn("gallery_images", serializer.fields)
        self.assertIn("allowed_payment_methods", serializer.fields)

    def test_public_serializer_returns_allowed_payment_methods(self):
        property_obj = Property(
            name="Hotel Green View Cottages",
            pay_at_property_allowed=True,
            online_payment_enabled=False,
        )

        data = PropertyPublicSerializer(property_obj).data

        self.assertEqual(data["allowed_payment_methods"], ["pay_at_property"])

        property_obj.online_payment_enabled = True

        data = PropertyPublicSerializer(property_obj).data

        self.assertEqual(
            data["allowed_payment_methods"],
            ["pay_at_property", "online_gateway"],
        )

    def test_admin_serializers_support_update_surfaces(self):
        detail_serializer = PropertyAdminSerializer()
        list_serializer = PropertyAdminListSerializer()

        self.assertIn("admin_notes", detail_serializer.fields)
        self.assertIn("status", detail_serializer.fields)
        self.assertIn("booking_enabled", list_serializer.fields)
