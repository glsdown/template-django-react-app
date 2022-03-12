from django.conf import settings
from django.core import mail
from django.test import TestCase
from rest_framework.exceptions import ErrorDetail
from rest_framework.test import APIClient

from accounts.models import CustomUser


class RegistrationTestCase(TestCase):
    def setUp(self):
        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            self.allowed_domain = settings.ALLOWED_EMAIL_DOMAINS[0]
        else:
            self.allowed_domain = "example"
        self.client = APIClient()
        self.example = {
            "email": f"test@{self.allowed_domain}.co.uk",
            "password": "123ABCcde456",
            "first_name": "Test",
            "last_name": "ABC",
            "title": "Other",
            "job_title": "Automated Test",
        }

    def test_allow_register(self):
        """Allow a user to register when they have the correct details
        populated, but not be active"""

        self.example["email"] = f"test@{self.allowed_domain}.co.uk"

        response = self.client.post(
            "/api/v1/auth/register",
            self.example,
            format="json",
        )

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Check response structure
        self.assertListEqual(list(response.data.keys()), ["user", "token"])
        self.assertListEqual(
            list(response.data["user"].keys()), ["id", "email"]
        )

        # Check token is not populated
        self.assertIsNone(response.data["token"])

        # Retrieve the registered user
        user = CustomUser.objects.get(email=self.example["email"])

        # Check the details are correct
        for field in ["first_name", "last_name"]:
            self.assertEqual(getattr(user, field), self.example[field])
        # Check the profile details are correct
        for field in [
            "title",
            "job_title",
        ]:
            self.assertEqual(getattr(user.profile, field), self.example[field])

    def test_restrict_register_domain(self):
        """Stop users registering with non-supported domains"""

        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            # Check supported domains can register
            for domain in settings.ALLOWED_EMAIL_DOMAINS:

                self.example["email"] = f"testdomain@{domain}.co.uk"

                response = self.client.post(
                    "/api/v1/auth/register",
                    self.example,
                    format="json",
                )

                # Check status code
                self.assertEqual(response.status_code, 200)

            # Check unsupport domains can't
            self.example["email"] = "testdomain@invalidemail.co.uk"

            response = self.client.post(
                "/api/v1/auth/register",
                self.example,
                format="json",
            )

            # Check status code
            self.assertEqual(response.status_code, 403)
            self.assertEqual(response.data, {"email": "Invalid email format"})

    def test_password_requirements(self):
        """
        Force password complexity
        """
        self.example["email"] = f"testpassword@{self.allowed_domain}.co.uk"

        # Must be populated
        self.example["password"] = ""
        response = self.client.post(
            "/api/v1/auth/register",
            self.example,
            format="json",
        )
        # Check status response
        self.assertEqual(response.status_code, 400)
        # Check detail response
        self.assertEqual(
            response.data,
            {
                "password": [
                    ErrorDetail(
                        string="This field may not be blank.", code="blank"
                    )
                ]
            },
        )

        # Check validity
        test_passwords = [
            # Minimum length = 8
            {
                "password": "Ta1",
                "message": "This password must contain at least 8 characters.",
            },
            {
                "password": "Ta1Ta2T",
                "message": "This password must contain at least 8 characters.",
            },
            # Max length = 100
            {
                "password": "1" + ("Ta" * 50),  # 101 characters long
                "message": "This password must contain at most 100 "
                + "characters.",
            },
            # Contains lower, upper and number
            {
                "password": "alllower",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            {
                "password": "ALLUPPER",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            {
                "password": "12349761238977238437",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            {
                "password": "31261lower",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            {
                "password": "31261UPPER",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            {
                "password": "WordsAndNoNumbers",
                "message": "This password must contain at least 1 digit, 1 "
                + "upper and 1 lower case character.",
            },
            # Not similar to email, first and last name
            {
                "password": f"TestPassword{self.allowed_domain}1",
                "message": "The password is too similar to the email address.",
            },
            # Not a common word/phrase/term
            {
                "password": "Password123",
                "message": "This password is too common.",
            },
        ]
        for password in test_passwords:
            self.example["password"] = password["password"]
            response = self.client.post(
                "/api/v1/auth/register",
                self.example,
                format="json",
            )
            # Check status response
            self.assertEqual(response.status_code, 400)
            # Check detail response
            self.assertEqual(
                response.data,
                {
                    "password": [
                        ErrorDetail(string=password["message"], code="invalid")
                    ]
                },
            )

    def test_activation_email(self):
        """
        Check the activation email is sent, and clicking the link
        sets the user to active
        """

        self.example["email"] = f"testactivation@{self.allowed_domain}.co.uk"

        # Register the user
        self.client.post(
            "/api/v1/auth/register",
            self.example,
            format="json",
        )

        # Retrieve the registered user
        user = CustomUser.objects.get(email=self.example["email"])

        # Check not active
        self.assertFalse(user.is_active)

        # Check email sent
        self.assertEqual(len(mail.outbox), 1)

        # Check email subject
        self.assertEqual(mail.outbox[0].subject, "Activate Your Account")

        # Check email link works
        body = mail.outbox[0].body.split("\n")
        pid, token = (
            "".join([line for line in body if line[:4] == "http"])
            .split("#/activate-account/")[1]
            .split("/")
        )

        # Activate the user
        response = self.client.post(
            "/api/v1/auth/activate",
            {"id": pid.strip(), "token": token.strip()},
            format="json",
        )

        # Check the response
        self.assertEqual(response.status_code, 200)

        # Check response structure
        self.assertListEqual(list(response.data.keys()), ["user", "token"])
        self.assertListEqual(
            list(response.data["user"].keys()), ["id", "email"]
        )

        # Check token is not populated
        self.assertIsNone(response.data["token"])

        # Retrieve the registered user
        user = CustomUser.objects.get(email=self.example["email"])

        # Check active
        self.assertTrue(user.is_active)
        self.assertTrue(user.profile.email_confirmed)

        # Check a reactivation doesn't work
        response = self.client.post(
            "/api/v1/auth/activate",
            {"id": pid.strip(), "token": token.strip()},
            format="json",
        )

        # Check the response
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data,
            {
                "non_field_errors": [
                    ErrorDetail(
                        string="This email has already been activated.",
                        code="invalid",
                    )
                ]
            },
        )
