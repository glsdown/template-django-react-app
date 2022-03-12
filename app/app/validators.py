import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordComplexityValidator:
    def __init__(self, min_length=8, max_length=100):
        self.min_length = min_length
        self.max_length = max_length

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                _(
                    "This password must contain at least %(min_length)d "
                    "characters."
                ),
                code="password_too_short",
                params={"min_length": self.min_length},
            )
        if len(password) > self.max_length:
            raise ValidationError(
                _(
                    "This password must contain at most %(max_length)d "
                    "characters."
                ),
                code="password_too_long",
                params={"max_length": self.max_length},
            )
        if not re.match(
            r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$", password
        ):
            raise ValidationError(
                _(
                    "This password must contain at least 1 digit, 1 upper "
                    "and 1 lower case character."
                ),
                code="password_missing_characters",
                params={},
            )

    def get_help_text(self):
        return _(
            f"Your password must contain between {self.min_length} and "
            f"{self.max_length} characters and at least 1 digit and 1 upper "
            "and 1 lower case character.."
        )
