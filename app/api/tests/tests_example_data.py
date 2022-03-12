import json

from django.conf import settings
from django.test import TestCase
from knox.models import AuthToken
from rest_framework.test import APIClient

from accounts.models import CustomUser
from api.models import ExampleDataTable


class ExampleDataTableTestCase(TestCase):
    def setUp(self):

        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            self.allowed_domain = settings.ALLOWED_EMAIL_DOMAINS[0]
        else:
            self.allowed_domain = "example"

        # Create two authenticated users
        self.user = CustomUser.objects.create_user(
            email=f"test@{self.allowed_domain}.co.uk",
            password="123ABC456cde",
            first_name="Test",
            last_name="123",
            is_active=True,
        )

        self.user2 = CustomUser.objects.create_user(
            email=f"test2@{self.allowed_domain}.co.uk",
            password="123ABC456cde",
            first_name="Test",
            last_name="123",
            is_active=True,
        )

        # Add some fake data
        self.examples = [
            ExampleDataTable.objects.create(
                name=f"Person {letter}1",
                email=f"user{letter}1@testdomain.co.uk",
                message=f"Test Message from user {letter}1",
                owner=self.user,
            )
            for letter in ["A", "B", "C"]
        ]

        # Add some fake data for user 2
        self.examples2 = [
            ExampleDataTable.objects.create(
                name=f"Person {letter}2",
                email=f"user{letter}2@testdomain.co.uk",
                message=f"Test Message from user {letter}2",
                owner=self.user2,
            )
            for letter in ["A", "B", "C"]
        ]

        # Create a token for a logged in user
        self.token = AuthToken.objects.create(self.user)[1]

        # Create the client
        self.client = APIClient()

    def test_authentication(self):
        """
        Check that the response forces an authenticated token
        """
        # Clear the credentials
        self.client.credentials()

        # Get the response
        # You may want to check all allowed methods here
        response = self.client.get(
            "/api/v1/examples/",
        )

        # Check status code
        self.assertEqual(
            response.status_code,
            401,
            "Unauthenticated GET examples request not status 401",
        )

    def test_get_response_structure(self):
        """
        Check that the GET response structure is as expected
        """

        # Authenticate user
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token)

        # Get the response
        response = self.client.get(
            "/api/v1/examples/",
        )

        # Check status code
        self.assertEqual(
            response.status_code,
            200,
            "GET examples does not provide 200 response",
        )

        # Check contains correct number of examples
        self.assertEqual(
            len(response.data),
            len(self.examples),
            "GET examples does not return all examples",
        )

        # Check only returns examples for the logged in user
        self.assertEqual(
            0,
            len([i for i in response.data if i["owner"] != self.user.id]),
            "Examples returned for non-logged in user",
        )

        # Check data response is correct
        expected_response = [
            {
                "id": o.id,
                "name": o.name,
                "email": o.email,
                "message": o.message,
                "owner": o.owner.id,
                "created_at": o.created_at.strftime("%d/%m/%Y %H:%M:%S"),
            }
            for o in sorted(
                self.examples, key=lambda x: x.created_at, reverse=True
            )
        ]

        self.assertEqual(
            json.loads(json.dumps(response.data)),
            expected_response,
            "GET examples response structure incorrect",
        )

        # Clear the credentials
        self.client.credentials()

    # Other tests should be included in here for:
    # GET "/api/v1/examples/1"
    # POST
    # PUT
    # PATCH
    # DELETE

    # Additionally tests for search and filter should also be included
