# Places to customise and modify the app

In here are all the places where the look and feel for the end user can be customised. It's important to note though that this doesn't cover adding or removing additional functionality, or customisation under the hood (e.g. field/table names), but rather styling what is currently in place in the base app, such as the app name or title.

## Frontend

There are a huge number of customisations and changes that can be made in the frontend, so I won't go through them here, but instead point out a couple of places where they are definitely recommended.

When you want to make changes to the frontend, you can find the files in `app/frontend/src`. In here, you will see that there are 4 folders:

1. `app` - contains the features related to how the app runs, including the main `App.js` file and redux store setup.
2. `components` - core features of the application
    - `layout` - components that are important to the layout of the app including the `Header`, `Loader` and `Pagination` components.
    - `router` - components that are important for routing purposes including the `PrivateRoute` and `NotFound` components.
3. `features` - individual folders relating to the redux state and related components. Each is sorted by function to keep related items together.

### Navbar

The navbar can be found in `app/frontend/src/components/layout/pageStructure/Header.js`. In here, you can customise the name that appears in the top of the bar, as well as the branding.

```js hl_lines="5"
// app/frontend/src/components/layout/pageStructure/Header.js

...
<Navbar.Brand as={Link} to="/">
    Test Django/React App
</Navbar.Brand>
...
```

### Favicon

The favicon can be found in the folder `app/frontend/static`, and can be replaced as it is.

### Tab title

The title of the tab that is displayed can be amended in the `app/frontend/templates/frontend/index.html` file:

```html hl_lines="4"
<!-- app/frontend/templates/frontend/index.html -->

...
<title>Example App</title>
...
```

### Email and Password verification

There is some frontend email and password verification which is defined in `app/frontend/src/app/helpers/validation.js`. You can define the regex pattern for email and passwords through the app, as well as the error messages in here.

If you update the list of allowed domains, you'll need to update it in here too:

```js hl_lines="4"
// app/frontend/src/app/helpers/validation.js

export const validEmail =
    /^[a-zA-Z0-9\._:$!%-']+@[a-zA-Z0-9\.-]*(?:mydomain|seconddomain)\.[a-zA-Z\\.]{2,5}$/; // eslint-disable-line
export const validEmailHelp = 'Email must be in the form xxx@xxx.xxx';
export const validPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,100}$/;
export const validPasswordHelp =
    'Your password must contain at least 1 number, 1 lowercase and 1 uppercase number, and be 8 or more characters.';
```

### Loading Spinner

The loading spinner you see appear can be customised in `app/frontend/src/components/layout/loader/Loader.js`. The current spinner uses the `react-spinners` library, and other examples can be found [here](https://www.davidhu.io/react-spinners/). To update the spinner, it's a simple case of changing which one is imported, as well as (potentially) the size and speed multiplier.

```js hl_lines="4 6"
// app/frontend/src/components/layout/loader/Loader.js

...
import RSLoader from 'react-spinners/PuffLoader';
...
<RSLoader size={200} speedMultiplier={0.8} />
...
```

### Metadata

Metadata about the frontend application can be found in the `package.json` file.

```json hl_lines="4 5 6"
// package.json

{
  "name": "webapp",
  "version": "1.0.0",
  "description": "This is an example web app built with Django and React.",
  ...
}
```

## Backend

### Core Settings

The majority of settings are handled in the `app/app/settings.py` file. These are the settings that you should look out for.

#### Environment Variables

The vast majority of the settings are controlled using environment variables, so you should update these:

=== "Local - Mac"

    If you are running it locally, you will need to export them to your current environment. I recommend using [direnv](https://direnv.net/) to manage these. Once you have it installed, you can use the `.envrc.example` file as a template to create your own `.envrc` file, and use direnv to automatically load them using `direnv allow .`. 

    Alternatively, you can just export them for each terminal session.

    ```zsh
    export ENVIRONMENT_DESCRIPTION='PROD' # PROD or DEV or TEST
    export SECRET_KEY='secret-generated-key-here'
    export DATABASE_NAME='database-name-here'
    export DATABASE_USER='database-user-here'
    export DATABASE_PASSWORD='database-user-password-here'
    export DATABASE_HOST='database-host-here'
    export DATABASE_PORT='database-port-here'
    # Only required if ENVIRONMENT_DESCRIPTON='PROD'
    export MAIL_SERVER='mail-server-here'
    export MAIL_PORT='mail-port-here'
    export MAIL_USERNAME='mail-username-here'
    export MAIL_PASSWORD='mail-password-here'
    ```

=== "Local - Windows"

    If you are running it locally, you will need to export them to your current environment. This will create a temporary environment variable. It will only exist for that terminal session, but is available immediately.

    ```sh
    setx ENVIRONMENT_DESCRIPTION PROD
    setx SECRET_KEY secret-generated-key-here
    setx DATABASE_NAME database-name-here
    setx DATABASE_USER database-user-here
    setx DATABASE_PASSWORD database-user-password-here
    setx DATABASE_HOST database-host-here
    setx DATABASE_PORT database-port-here
    setx MAIL_SERVER mail-server-here
    setx MAIL_PORT mail-port-here
    setx MAIL_USERNAME mail-username-here
    setx MAIL_PASSWORD mail-password-here
    ```

=== "Elastic Beanstalk"

    More details on these can be found in [elastic-beanstalk-deployment](/elastic-beanstalk-deployment.html)

    ```yml
    ENVIRONMENT_DESCRIPTION: PROD
    SECRET_KEY: secret-generated-key-here
    DATABASE_NAME: database-name-here
    DATABASE_USER: database-user-here
    DATABASE_PASSWORD: database-user-password-here
    DATABASE_HOST: database-host-here
    DATABASE_PORT: database-port-here
    MAIL_SERVER: mail-server-here
    MAIL_PORT: mail-port-here
    MAIL_USERNAME: mail-username-here
    MAIL_PASSWORD: mail-password-here
    ```

#### Database

You need to add your own production database backend. The engines available are:

-   `"django.db.backends.postgresql"`
-   `"django.db.backends.mysql"`
-   `"django.db.backends.sqlite3"`
-   `"django.db.backends.oracle"`

!!! warning "Postgresql Usage with Elastic Beanstalk"

    If you are using Postgres with elastic beanstalk, you should also make sure to include the hidden dependency `psycopg2-binary` in your requirements file. This is instead of `pyscopg2`.

```python hl_lines="3"
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        ...
    }
}
```

##### PostgresSQL Schemas

When using postgresSQL, you probably want to make use of schemas. This is possible to do, but does have a couple of caveats. In the `settings.py` file, there is a default schema included:

```python hl_lines="7"
# Use with Postgres to specify a default schema
DEFAULT_SCHEMA = "application"

DATABASES = {
    "default": {
        ...
        "OPTIONS": {"options": f"-c search_path={DEFAULT_SCHEMA},public"},
        ...
    }
}
```

If you want specific models in custom schemas, the easiest way is to make use of the `db_table` setting within the model `Meta` class:

```python hl_lines="8"
# accounts/models.py

class Profile(models.Model):
    ...
    class Meta:
        ...
        # fmt: off
        db_table = 'accounts\".\"profile'
        # fmt: on
        ...
```

In this example, I am setting this table called `profile` to be in the `accounts` schema.

It's worth mentioning that formatters don't like this syntax (hence the `fmt` comments), but it's valid and required for Django to recognise this is a table within a schema.

When building this table, Django won't create the schemas for you - these need to be in place prior to running the migrations. There is a script to build this in `database-setup.py`.

```
python database-setup.py initial-setup
```

Additionally, these will need to be included in the template database used when testing (as defined within the DATABASES setting). If you use the `database-setup.py` script to build the template database, it will add the schemas for you.

```python hl_lines="7"
# app/settings.py

DATABASES = {
    "default": {
        ...
        # Test settings
        "TEST": {"NAME": "test_development", "TEMPLATE": "template_test"},
    }
}
```

#### Allowed Hosts

When you run your application in production, you will need to add the production address to the allowed hosts.

```python
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
]
```

#### Allowed email domains

In this is set up a restriction on the domains that users are able to log up with. To set these, add the restrictions as a list in `app/settings.py`.

```python
# app/settings.py

# Emails that the user can sign up with
ALLOWED_EMAIL_DOMAINS = ["mydomain", "seconddomain"]
```

If you set this as an empty list, then all domains will be allowed. Don't forget - when you change this, you'll also need to change the email validator in the fronend.

#### Admins

You need to update the names and email addresses of the people to send error logs to when in production:

```python
ADMINS = [("Mary", "mary@example.com"), ("John", "john@example.com")]
```

#### Email settings

Change the default email details:

```python
DEFAULT_FROM_EMAIL = "Sender Name <support@example.com>"
EMAIL_SUBJECT_PREFIX = "Application Name - "
```

### Emails

#### Base Message

The base message template is included in the accounts templates folder at `app/accounts/templates/email/base_message.html`. This is used to style the HTML emails that are sent out. There are a number of features in here that can be customised, but the ones that are most likely to require changing include:

##### The `title` metadata

This is for when the title isn't provided in the html message using the template.

```html hl_lines="2"
...
<title>{% block title %}Example App{% endblock %}</title>
...
```

##### The main body of the email

The `{% block content %} {% endblock %}` section is where the contents from the individual emails will be placed. The remainder is styling choices.

```html hl_lines="2 5 6 7 8 9 12 14 17"
...
<div style="background-color: #005eb8; height: 40px"></div>
<div
    style="
    background-color: #e9ecef;
    height: 100px;
    font-family: sans-serif;
    padding: 40px;
    box-sizing: border-box;
    "
>
    <h2>Example App</h2>
</div>
<div style="min-height: 300px; padding: 40px; font-family: sans-serif">
    {% block content %} {% endblock %}
</div>
<div style="background-color: #005eb8; height: 20px"></div>
...
```

#### Account Activation email

The main wording and templates for the account activation email (the one sent when a new account is requested) can be found in `app/accounts/templates/email`. There is a html and text file in there, and both will need updating simultaneously.

##### HTML Template

In the html file, you will see that there are blocks to be inserted into the base_message template. These are all likely to require updating:

```html hl_lines="5 8 12 13 14 15"
<!-- app/accounts/templates/email/account_activation_email.html -->

{% extends 'base_message.html' %}
{% block title %}
Confirm registration
{% endblock %}
{% block preview %}
Please confirm your email to get access to the Portal.
{% endblock %}
{% block content %}

  <p>Hi {{ user.first_name }} {{user.last_name }},</p>
  Thanks for signing up to the Portal.</p>

    <p>Please click on the link below to confirm your registration:</p>
    <p>
    <!-- prettier-ignore -->
    {% autoescape off %}
    http://{{ domain }}/#/activate-account/{{uid}}/{{token}}
    {% endautoescape %}
</p>

{% endblock %}
```

You can change the subject line for the email the user receives when they request a new account by changing the subject line in the accounts helpers file.

```python hl_lines="5"
# app/accounts/helpers.py

def send_account_activation_email(user, current_site):
    ...
    subject = "Activate Your Account"
    ...
```

If you change this, you will also need to update the test in `tests_register.py`.

```python hl_lines="6"
# app/accounts/tests/tests_register.py

def test_activation_email(self):
    ...
    # Check email subject
    self.assertEqual(mail.outbox[0].subject, "Activate Your Account")
    ...
```

##### Plaintext template

In the `.txt` file, there is less customisation available, and here you can only change the message that the user receives.

```hl_lines="4 5 6 7 8"
# app/accounts/templates/email/account_activation_email.txt

{% autoescape off %}
Hi {{ user.first_name }} {{user.last_name }},

Thanks for signing up to the Portal. Please click on the link below to
confirm your registration:

http://{{ domain }}/#/activate-account/{{uid}}/{{token}}

{% endautoescape %}
```

#### Password Reset email

The main wording and templates for the password reset email (the one sent when the user requests a password reset) can be found in `app/accounts/templates/email`. There is a html and text file in there, and both will need updating simultaneously.

##### HTML Template

In the html file, you will see that there are blocks to be inserted into the base_message template. These are all likely to require updating:

```html hl_lines="5 7 11 14 15 18 25 27"
<!-- app/accounts/templates/email/password_reset_email.html -->

{% extends 'base_message.html' %}
<!-- prettier-ignore -->
{% block title %} Reset password {% endblock%} 
{% block preview %} 
We have received a request to reset your password 
{% endblock %} 
{% block content %}

<p>Hi {{user.first_name}} {{user.last_name}},</p>

<p>
    You're receiving this email because you requested a password reset for your
    user account on the Example Website.
</p>

<p>Please go to the following page and choose a new password:</p>

<!-- prettier-ignore -->
{% autoescape off %} {% block reset_link %}
{{ reset_password_url }}
{% endblock %} {% endautoescape %}

<p>Your login email, in case you've forgotten, is: {{ email }}</p>

<p>Thanks for using our site!</p>

{% endblock %}
```

You can change the subject line for the email the user receives when they request a new password by changing the subject line in the accounts helpers file.

```python hl_lines="5"
# app/accounts/helpers.py

def send_password_reset_email(user, key, current_site):
    ...
    subject = "Reset your password"
    ...
```

If you change this, you will also need to update the test in `tests_password_reset.py`.

```python hl_lines="6"
# app/accounts/tests/tests_password_reset.py

def test_password_reset(self):
    ...
    # Check email subject
    self.assertEqual(mail.outbox[0].subject, "Reset your password")
    ...
```

##### Plaintext template

In the `.txt` file, there is less customisation available, and here you can only change the message that the user receives.

```hl_lines="3 5 6 8 16 18"
# app/accounts/templates/email/password_reset_email.txt

Hi {{user.first_name}} {{user.last_name}},

You're receiving this email because you requested a password reset for your
user account on the Example Website.

Please go to the following page and choose a new password:

{% autoescape off %}
{% block reset_link %}
{{ reset_password_url }}
{% endblock %}
{% endautoescape %}

Your login email, in case you've forgotten, is: {{ email }}

Thanks for using our site!
```

### Error Messages

#### Account Activation Error Message

If the user tries to activate their account with invalid details, this is the error that will appear in the frontend response. You can update it by changing the error message in the accounts serializers page.

```python hl_lines="7 11 14"
# app/accounts/serializers.py

class ActivateAccountSerializer(serializers.Serializer):
    ...

    def validate(self, data):
        ...
            raise serializers.ValidationError(
                "Unable to find this user. Please try again."
            )
        ...
            raise serializers.ValidationError(
                "This email has already been activated."
            )
        ...
            raise serializers.ValidationError("Invalid activation token.")
        ...
```

#### Login Error Message

If the user tries to login, but either their account hasn't been activated yet, or their credentials are incorrect, then another error message will be displayed to them. This can also be updated in the accounts serializers page.

```python hl_lines="9 15 16 19"
# app/accounts/serializers.py

class LoginSerializer(serializers.Serializer):
    ...

    def validate(self, data):
        ...
        except Exception:
            raise serializers.ValidationError("Username not recognised.")

        if user and not user.is_active:
            ...
            raise serializers.ValidationError(
                "This email has not been validated. Please check your "
                "emails for the validation link."
            )
        raise serializers.ValidationError(
            "Password incorrect. Please try again."
        )
```
