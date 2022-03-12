from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from .helpers import send_account_activation_email
from .tokens import account_activation_token
from accounts.models import CustomUser


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "email")


# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, value):

        if value is not None:
            data = self.context["request"].data
            # here data has all the fields which have validated values
            # so we can create a CustomUser instance out of it
            user_data = {
                "first_name": data.get("first_name"),
                "last_name": data.get("last_name"),
                "email": data.get("email"),
            }
            user = CustomUser(**user_data)

            # get the password from the data
            password = data.get("password")

            errors = dict()
            try:
                # validate the password and catch the exception
                validate_password(password=password, user=user)

            # the exception raised here is different than
            # serializers.ValidationError
            except ValidationError as e:
                errors = list(e.messages)

            if errors:
                raise serializers.ValidationError(errors)

        return value

    def create(self, validated_data):

        # Deactivate the account until it's been confirmed
        validated_data["is_active"] = False
        user = CustomUser.objects.create_user(**validated_data)

        # Send the account activation email
        current_site = get_current_site(
            self.context["request"]
        )  # e.g. www.domain.co.uk
        send_account_activation_email(user, current_site)

        return user


class ActivateAccountSerializer(serializers.Serializer):
    token = serializers.CharField()
    id = serializers.CharField()

    def validate(self, data):

        # Tries to find the user based on the information encoded in the url
        # used including the user ID and activation code
        try:
            uid = urlsafe_base64_decode(data.get("id"))
            user = CustomUser.objects.get(pk=uid)
        except (
            TypeError,
            ValueError,
            OverflowError,
            CustomUser.DoesNotExist,
        ):
            raise serializers.ValidationError(
                "Unable to find this user. Please try again."
            )

        if user.is_active:
            raise serializers.ValidationError(
                "This email has already been activated."
            )
        # If it could identify the user, but the token isn't valid
        if not account_activation_token.check_token(user, data.get("token")):
            raise serializers.ValidationError("Invalid activation token.")

        return user


# Login Serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user

        # If not authenticated, check if they are not yet activated
        try:
            user = CustomUser.objects.get(email=data["email"])
        # If we can't find the user
        except Exception:
            raise serializers.ValidationError("Username not recognised.")

        if user and not user.is_active:
            # Send the account activation email
            current_site = get_current_site(
                self.context["request"]
            ).domain  # e.g. www.domain.co.uk
            send_account_activation_email(user, current_site)

            # Raise an error
            raise serializers.ValidationError(
                "This email has not been validated. Please check your "
                "emails for the validation link."
            )
        raise serializers.ValidationError(
            "Password incorrect. Please try again."
        )
