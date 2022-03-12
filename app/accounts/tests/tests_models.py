from django.conf import settings
from django.core.exceptions import ValidationError
from django.test import TestCase

from accounts.models import CustomUser, Profile


class UserTestCase(TestCase):
    def setUp(self):
        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            self.allowed_domain = settings.ALLOWED_EMAIL_DOMAINS[0]
        else:
            self.allowed_domain = "example"

        CustomUser.objects.create_user(
            email=f"test@{self.allowed_domain}.co.uk",
            password="123ABC456cde",
            first_name="Test",
            last_name="123",
        )

    def test_user_added_properties(self):
        """The string representation of the user is correct"""

        user = CustomUser.objects.get(
            email=f"test@{self.allowed_domain}.co.uk"
        )
        self.assertEqual(
            str(user), f"Test 123 (test@{self.allowed_domain}.co.uk)"
        )

    def test_linked_profile_created(self):
        """A profile is automatically created when a user is"""

        user = CustomUser.objects.get(
            email=f"test@{self.allowed_domain}.co.uk"
        )
        self.assertIsNotNone(Profile.objects.get(user_id=user.id))

    def test_restricted_user_email(self):
        """Only non-restricted email addresses can sign up"""

        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            try:
                CustomUser.objects.create_user(
                    email="test@invalidemail.co.uk",
                    password="123ABC456cde",
                    first_name="Test",
                    last_name="123",
                )
                raise AssertionError("ValidationError not raised")
            except ValidationError as e:
                self.assertTrue("email" in e.message_dict)

    def test_allowed_user_email(self):
        """Allowed email addresses can sign up"""

        for domain in settings.ALLOWED_EMAIL_DOMAINS:
            self.assertIsNotNone(
                CustomUser.objects.create_user(
                    email=f"newtest@{domain}.co.uk",
                    password="123ABC456cde",
                    first_name="Test",
                    last_name="123",
                )
            )
