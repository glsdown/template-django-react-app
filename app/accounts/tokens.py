from django.contrib.auth.tokens import PasswordResetTokenGenerator

# Token generation for the account activation emails - make sure that it is
# a valid token. Extends the default token generator


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.profile.email_confirmed)
        )


account_activation_token = AccountActivationTokenGenerator()
