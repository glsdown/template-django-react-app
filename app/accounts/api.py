from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ValidationError
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from knox.models import AuthToken
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .helpers import send_password_reset_email
from .serializers import (
    ActivateAccountSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


# Register API
class RegisterAPI(generics.GenericAPIView):
    """
    Allows the user to register for a new account, and sends an email asking
    them to confirm their email address.
    """

    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        # Validate the data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save the user
        try:
            user = serializer.save()
        except ValidationError:
            return Response(
                {"email": "Invalid email format"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Save the profile details
        user.refresh_from_db()
        for field in ["title", "job_title"]:
            if field in request.data:
                setattr(user.profile, field, request.data[field])

        # Make any other changes to the user here as required
        # e.g. forcing specific domains to be superusers by default
        # if user.email.split("@")[1] == "superuserdomain.co.uk":
        #   user.is_staff = True
        #   user.is_superuser = True

        # Save the user with the profile details
        user.save()

        # Return the API respose with the user details and empty token
        # The token is empty so that the user is forced to activate their
        # account prior to being able to log in
        return Response(
            {
                "user": UserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": None,
            },
            status=status.HTTP_200_OK,
        )


# Activate account API
class ActivateAccountAPI(generics.GenericAPIView):
    """
    Activates a user account based on a given encoded user ID and token.
    """

    serializer_class = ActivateAccountSerializer

    # What happens when a GET request is sent to this view i.e. someone types
    # in (or clicks on) .../accounts/activate_account
    def post(self, request, *args, **kwargs):

        # Validate the data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the validated user details
        user = serializer.validated_data
        # Set the user's active state to true so they can log in
        user.is_active = True
        # Set their profile to say the email was confirmed
        user.profile.email_confirmed = True
        # Save the updates
        user.save()

        # Return the API respose with the user details and null token
        return Response(
            {
                "user": UserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": None,
                # This option would automatically log them in
                # "token": AuthToken.objects.create(user)[1],
            },
            status=status.HTTP_200_OK,
        )


# Login API
class LoginAPI(generics.GenericAPIView):
    """
    Provided an email address and password, provides the user and token \
    details to log the user in.

    post: Requests a user login
    """

    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        return Response(
            {
                "user": UserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": AuthToken.objects.create(user)[1],
            },
            status=status.HTTP_200_OK,
        )


# Get User API
class UserAPI(generics.RetrieveAPIView):
    """
    Returns the user details connected to the provided token
    """

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# Password reset
@receiver(reset_password_token_created)
def password_reset_token_created(
    sender, instance, reset_password_token, *args, **kwargs
):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    """

    current_site = get_current_site(instance.request).domain

    # send an e-mail to the user
    send_password_reset_email(
        reset_password_token.user, reset_password_token.key, current_site
    )
