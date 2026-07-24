from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class StaffLoginAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("accounts:login")
        self.password = "StrongLocalPassword123!"
        self.user = get_user_model().objects.create_user(
            email="admin-login@example.com",
            password=self.password,
            full_name="Admin Login",
            role=get_user_model().Role.ADMIN,
            is_staff=True,
            is_active=True,
        )

    def post_login(self, payload):
        return self.client.post(self.login_url, payload, format="json")

    def test_successful_login_returns_tokens_and_safe_user_data(self):
        response = self.post_login(
            {
                "email": self.user.email,
                "password": self.password,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], self.user.email)
        self.assertNotIn("password", response.data["user"])
        self.assertNotIn("is_superuser", response.data["user"])
        self.assertNotIn("groups", response.data["user"])
        self.assertNotIn("user_permissions", response.data["user"])

    def test_successful_login_accepts_identifier_field(self):
        response = self.post_login(
            {
                "identifier": self.user.email,
                "password": self.password,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_wrong_password_returns_safe_validation_error(self):
        response = self.post_login(
            {
                "email": self.user.email,
                "password": "wrong-password",
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Invalid login credentials.")

    def test_unknown_user_returns_safe_validation_error(self):
        response = self.post_login(
            {
                "email": "unknown-login@example.com",
                "password": self.password,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(
            response.data["message"],
            "No active staff account found for this login.",
        )

    def test_missing_identifier_returns_validation_error(self):
        response = self.post_login({"password": self.password})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Email or phone number is required.")

    def test_missing_password_returns_field_error(self):
        response = self.post_login({"email": self.user.email})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "This field is required.")
        self.assertIn("password", response.data["errors"])

    def test_inactive_user_cannot_login(self):
        inactive_user = get_user_model().objects.create_user(
            email="inactive-login@example.com",
            password=self.password,
            full_name="Inactive Login",
            role=get_user_model().Role.ADMIN,
            is_staff=True,
            is_active=False,
        )

        response = self.post_login(
            {
                "email": inactive_user.email,
                "password": self.password,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(
            response.data["message"],
            "No active staff account found for this login.",
        )

    def test_malformed_json_returns_safe_error(self):
        response = self.client.generic(
            "POST",
            self.login_url,
            data='{"email": "admin-login@example.com",',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    @override_settings(DEBUG=False)
    def test_unexpected_login_error_is_logged_and_returns_safe_500(self):
        client = Client(raise_request_exception=False)

        with (
            patch(
                "apps.accounts.services.AuthService.get_staff_user_by_identifier",
                side_effect=RuntimeError("synthetic login failure"),
            ),
            self.assertLogs("apps.common.exceptions", level="ERROR") as logs,
        ):
            response = client.post(
                self.login_url,
                data={
                    "email": self.user.email,
                    "password": self.password,
                },
                content_type="application/json",
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertJSONEqual(
            response.content,
            {
                "success": False,
                "message": "Internal server error",
                "errors": {},
            },
        )
        self.assertTrue(any("Unhandled API exception" in message for message in logs.output))
