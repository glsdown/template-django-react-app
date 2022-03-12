import re

from django.conf import settings
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """

    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_("The Email must be set"))
        # Restrict who can sign up
        if len(settings.ALLOWED_EMAIL_DOMAINS) > 0:
            if not re.match(
                r"^[a-zA-Z0-9\._:$!%-']+@[a-zA-Z0-9\.-]*(?:"
                + "|".join(settings.ALLOWED_EMAIL_DOMAINS)
                + r")\.[a-zA-Z\\.]{2,5}$",
                email,
            ):
                raise ValidationError({"email": _("Invalid Email format")})

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(email, password, **extra_fields)

    def get_by_natural_key(self, username):
        """
        Make the username case insensitive
        """
        case_insensitive_username_field = "{}__iexact".format(
            self.model.USERNAME_FIELD
        )
        return self.get(**{case_insensitive_username_field: username})


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        ordering = ["email"]
        verbose_name = "User"


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    email_confirmed = models.BooleanField(default=False)
    job_title = models.CharField(max_length=100, null=True, blank=True)
    title = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return str(self.user)

    class Meta:
        ordering = ["user__id"]


# This function is special - it basically ensures that a related profile is
# created whenever a new user is created.
@receiver(post_save, sender=CustomUser)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
