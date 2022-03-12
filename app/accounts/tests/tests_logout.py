from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomUser


class LogoutTestCase(TestCase):
    def setUp(self):
        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            self.allowed_domain = settings.ALLOWED_EMAIL_DOMAINS[0]
        else:
            self.allowed_domain = "example"
        self.email = f"test@{self.allowed_domain}.co.uk"
        self.password = "123ABC456cde"
        self.user = CustomUser.objects.create_user(
            email=self.email,
            password=self.password,
            first_name="Test",
            last_name="123",
            is_active=True,
        )
        self.client = APIClient()

    def test_check_logout(self):
        """
        With a valid token, logs the user our
        """

        # Log the user in
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.email, "password": self.password},
            format="json",
        )

        token = response.data["token"]

        # Check token is valid
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 200)

        # Log the user out
        response = self.client.post(
            "/api/v1/auth/logout",
            {},
            format="json",
        )

        # Check status code
        self.assertEqual(response.status_code, 204)
        # Check empty response
        self.assertIsNone(response.data)

        # Check token is invalid
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 401)
