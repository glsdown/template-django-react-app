from django.conf import settings
from django.core import mail
from django.test import TestCase
from rest_framework.exceptions import ErrorDetail
from rest_framework.test import APIClient

from accounts.models import CustomUser


class PasswordResetCase(TestCase):
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
        self.inactiveUser = CustomUser.objects.create_user(
            email=f"inactiveUser@{self.allowed_domain}.co.uk",
            password=self.password,
            first_name="Test",
            last_name="123",
            is_active=False,
        )
        self.client = APIClient()

    def test_password_reset(self):
        """
        Check requesting a password reset flow works
        """
        # Send a request with the email
        response = self.client.post(
            "/api/v1/auth/password-reset/",
            {"email": self.email},
            format="json",
        )

        # Check the response is as expected
        self.assertEqual(response.status_code, 200)

        # Check email sent
        self.assertEqual(len(mail.outbox), 1)

        # Check email subject
        self.assertEqual(mail.outbox[0].subject, "Reset your password")

        # Check email link works
        body = mail.outbox[0].body.split("\n")
        token = (
            "".join([line for line in body if line[:4] == "http"])
            .split("/#/reset-password?token=")[1]
            .strip()
        )

        # Confirm the password reset
        new_password = "Dog15GodBackwards"
        response = self.client.post(
            "/api/v1/auth/password-reset/confirm/",
            {"token": token, "password": new_password},
            format="json",
        )

        # Check the response is as expected
        self.assertEqual(response.status_code, 200)

        # Check the new password works
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.email, "password": new_password},
            format="json",
        )

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Check the old password fails
        response = self.client.post(
            "/api/v1/auth/login",
            {"email": self.email, "password": self.password},
            format="json",
        )

        # Check status code
        self.assertEqual(response.status_code, 400)

        # Confirm the old password reset link fails
        response = self.client.post(
            "/api/v1/auth/password-reset/confirm/",
            {"token": token, "password": new_password},
            format="json",
        )

        # Check the response is as expected
        self.assertEqual(response.status_code, 404)

    def test_password_reset_no_email_fail(self):
        """
        Check that requesting a password reset with a non-registered and
        non-active email fails.
        """

        for email in [
            f"unregisteredemail@{self.allowed_domain}.co.uk",  # Unknown
            self.inactiveUser.email,  # Registered, but inactive
        ]:

            # Send a request with the email
            response = self.client.post(
                "/api/v1/auth/password-reset/",
                {"email": email},
                format="json",
            )

            # Check the response is as expected
            self.assertEqual(response.status_code, 400)
            self.assertEqual(
                response.data,
                {
                    "email": [
                        ErrorDetail(
                            string="We couldn't find an account associated "
                            + "with that email. Please try a different "
                            + "e-mail address.",
                            code="invalid",
                        )
                    ]
                },
            )

    def test_invalid_confirmation_fail(self):
        """
        Test that a response with an invalid request is rejected
        """
        # Create a response to the confirmation without a token
        response = self.client.post(
            "/api/v1/auth/password-reset/confirm/",
            {"token": None, "password": self.password},
            format="json",
        )
        # Check the response is as expected
        self.assertEqual(response.status_code, 400)
