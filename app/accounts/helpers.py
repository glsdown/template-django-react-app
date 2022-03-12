from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .tokens import account_activation_token


def send_account_activation_email(user, current_site):
    """
    Send an email to the user with a link to validate their account
    """

    subject = "Activate Your Account"
    data = {
        "user": user,
        "domain": current_site.domain,
        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
        "token": account_activation_token.make_token(user),
    }
    html_message = render_to_string(
        "email/account_activation_email.html", data
    )
    message = render_to_string("email/account_activation_email.txt", data)

    # Send the email
    user.email_user(subject, message, html_message=html_message)


def send_password_reset_email(user, key, current_site):
    """
    Send an email to the user with a link to reset their password
    """

    subject = "Reset your password"
    data = {
        "user": user,
        "email": user.email,
        "reset_password_url": (
            f"http://{current_site}/#/reset-password?token={key}"
        ),
    }
    html_message = render_to_string("email/password_reset_email.html", data)
    message = render_to_string("email/password_reset_email.txt", data)

    # Send the email
    user.email_user(subject, message, html_message=html_message)
