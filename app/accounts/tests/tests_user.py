from django.conf import settings
from django.test import TestCase
from knox.models import AuthToken
from rest_framework.test import APIClient

from accounts.models import CustomUser


class UserTestCase(TestCase):
    def setUp(self):

        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            self.allowed_domain = settings.ALLOWED_EMAIL_DOMAINS[0]
        else:
            self.allowed_domain = "example"

        self.user = CustomUser.objects.create_user(
            email=f"test@{self.allowed_domain}.co.uk",
            password="123ABC456cde",
            first_name="Test",
            last_name="123",
            is_active=True,
        )
        self.client = APIClient()

    def test_check_token_response(self):
        """
        With a valid token, the API call to fetch the user is authenticated
        """
        # Create a token for the logged in user
        token = AuthToken.objects.create(self.user)[1]

        # Check token is valid
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 200)

        # Clear the credentials
        self.client.credentials()

        # Create an invalid token
        token = "invalidtokenstring123456789"

        # Check token is invalid
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 401)

        # Clear the credentials
        self.client.credentials()

        # Delete the token
        AuthToken.objects.get(user=self.user).delete()
        try:
            token = AuthToken.objects.get(user=self.user)[1]
        except Exception:
            token = "blank"

        # Check token is invalid
        self.client.credentials(HTTP_AUTHORIZATION="Token " + token)
        response = self.client.get("/api/v1/auth/user")
        self.assertEqual(response.status_code, 401)

        # Clear the credentials
        self.client.credentials()
