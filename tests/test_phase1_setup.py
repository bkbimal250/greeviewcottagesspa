from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status

from apps.common.responses import error_response, success_response
from apps.common.utils import normalize_phone_number


class Phase1SetupTests(SimpleTestCase):
    def test_auth_and_schema_urls_are_registered(self):
        self.assertEqual(reverse("accounts:login"), "/api/v1/auth/login/")
        self.assertEqual(reverse("accounts:request-otp"), "/api/v1/auth/request-otp/")
        self.assertEqual(reverse("accounts:verify-otp"), "/api/v1/auth/verify-otp/")
        self.assertEqual(reverse("schema"), "/api/schema/")
        self.assertEqual(reverse("swagger-ui"), "/api/docs/")
        self.assertEqual(reverse("redoc"), "/api/redoc/")

    def test_api_response_helpers_use_standard_shape(self):
        response = success_response(data={"ok": True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["data"], {"ok": True})

        error = error_response(message="Invalid input", errors={"field": ["Required"]})
        self.assertEqual(error.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(error.data["success"], False)
        self.assertEqual(error.data["errors"], {"field": ["Required"]})

    def test_phone_normalization_defaults_to_india_country_code(self):
        self.assertEqual(normalize_phone_number("9876543210"), "+919876543210")
