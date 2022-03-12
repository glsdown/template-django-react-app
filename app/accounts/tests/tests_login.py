from django.conf import settings
from django.test import TestCase
from rest_framework.exceptions import ErrorDetail
from rest_framework.test import APIClient

from accounts.models import CustomUser


class LoginTestCase(TestCase):
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

    def test_login_response(self):
        """
        User is able to log in with correct credentials
        and valid response (including token) is provided
        """
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.email, "password": self.password},
            format="json",
        )

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Check response structure
        self.assertListEqual(list(response.data.keys()), ["user", "token"])
        self.assertListEqual(
            list(response.data["user"].keys()), ["id", "email"]
        )

        # Check token is populated
        self.assertIsNotNone(response.data["token"])

        # Check token is valid
        self.client.credentials(
            HTTP_AUTHORIZATION="Token " + response.data["token"]
        )
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 200)

        # Clear the credentials
        self.client.credentials()

    def test_login_incorrect_password(self):
        """
        User is not able to log in with invalid password
        and valid response is provided
        """
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.email, "password": "InvalidPassword"},
            format="json",
        )
        # Check status code
        self.assertEqual(response.status_code, 400)

        # Check detail response
        self.assertEqual(
            response.data,
            {
                "non_field_errors": [
                    ErrorDetail(
                        string="Password incorrect. Please try again.",
                        code="invalid",
                    )
                ]
            },
        )

        # Clear the credentials
        self.client.credentials()

    def test_login_incorrect_email(self):
        """
        User is not able to log in with invalid username
        and valid response is provided
        """
        response = self.client.post(
            "/api/v1/auth/login",
            {
                "email": f"invalid@{self.allowed_domain}.co.uk",
                "password": self.password,
            },
            format="json",
        )
        # Check status code
        self.assertEqual(response.status_code, 400)

        # Check detail response
        self.assertEqual(
            response.data,
            {
                "non_field_errors": [
                    ErrorDetail(
                        string="Username not recognised.", code="invalid"
                    )
                ]
            },
        )

        # Clear the credentials
        self.client.credentials()
