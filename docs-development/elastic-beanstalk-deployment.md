# Deploying to Elastic Beanstalk

There are two considerations when deploying to elastic beanstalk:

1. Application Set up
2. Healthcheck

## 1. Application set up

### Extensions

To get the app ready for Elastic Beanstalk, create a folder in the `app` folder called `.ebextensions`. In here, you can add multiple `.config` files containing details required by elastic beanstalk.

#### Django configuration

Broadly, one file needs to contain the settings required for a Django app to run. Specifically, the file should contain the following:

```yml
# app/.ebextensions/django.config

option_settings:
    aws:elasticbeanstalk:container:python:
        WSGIPath: app.wsgi:application
    aws:elasticbeanstalk:environment:proxy:staticfiles:
        /static: static
```

#### Environment Variables

In another file, you should include all the required environment variables. Specifically:

```yml
# app/.ebextensions/environment.config

option_settings:
    aws:elasticbeanstalk:application:environment:
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

!!! danger "Environment Variables"

    This file contains sensitive environment variables - make sure it is not included in your source control.

    ```sh hl_lines="3"
    # .gitignore

    environment.config
    ...
    ```

### EBIgnore

You should also have an `.ebignore` file that contains globs of all files and folders that should not be uploaded to elastic beanstalk. There may be some folders or files you create that you don't want uploaded in addition, but in particular, you should make sure the following folders are included:

```sh
# app/.ebignore

# Requirements files (NOT requirements.txt as this is needed by EB)
requirements.in

# React bits not required
frontend/src
frontend/static

# Django folders not required
**/migrations
sent_emails

# Additional dev-only folders
__pycache__

# Other files not to include
*.sqlite3

```

### Postgresql usage

As noted in [app-settings](/app-settings.html#database), if you are using Postgres with elastic beanstalk, you should also make sure to include the hidden dependency `psycopg2-binary` in your requirements file. This is instead of `pyscopg2`.

```python hl_lines="3"
# app/requirements.in

psycopg2-binary
```

## 2. Healthcheck

By default, the app will automatically fail all healthchecks, so always look like it is failing. However, there are a number of settings that can be used to stop this.

Firstly, you need to install, then include `django-ebhealthcheck` into your requirements file.

```zsh
pip install django-ebhealthcheck
```

```python hl_lines="3"
# app/requirements.in
...
django-ebhealthcheck
...
```

```zsh
pip-compile app/requirements.in
```

Next, in your settings, add this as an installed app:

```python hl_lines="5"
# app/app/settings.py

INSTALLED_APPS = [
    ...
    "ebhealthcheck.apps.EBHealthCheckConfig",
    ...
]
```

Finally, you'll need to include the following:

```python
# app/app/settings.py

import requests

def get_ec2_instance_ip():
    """
    Try to obtain the IP address of the current EC2 instance in AWS
    """
    try:
        ip = requests.get(
            "http://169.254.169.254/latest/meta-data/local-ipv4",
            timeout=0.01,
        ).text
    except requests.exceptions.ConnectionError:
        return None

    return ip

AWS_LOCAL_IP = get_ec2_instance_ip()

# Add additional required addressed into allowed hosts
ALLOWED_HOSTS += [
    AWS_LOCAL_IP,
    ".elasticbeanstalk.com",
    ".amazonaws.com",
    ".my-public-domain.com"
]
```

## App Deployment

TODO: Add details about setting eb up for the app, and how to deploy - mention node_modules being a nightmare

When you are ready to deploy it, you'll need to install `awsebcli`. To do this use the command:

```
pip install awsebcli
```

You might also want to add it to `requirements-dev.txt` too:

```python hl_lines="3"
# requirements-dev.txt

awsebcli
...
```

You'll then need to `cd` into the `app` folder to initialise the elastic beanstalk application. A summary of the `eb` commands can be found [here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-cmd-commands.html).

The first you'll need to use is:

```sh
eb init -i
```

This initialises the elastic beanstalk repository for you. You'll need to work through all of the options here as required.

!!! info "Access Keys"

    You may have difficulties with the Access Key and Secret Access Key. If you do, make sure that they are set in your environment variables correctly (if you have set the IAM user with access to the S3 bucket as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, you'll probably be told you don't have access).

Next, you can create an environment to deploy to by running:

```sh
eb create
```

Again, you will be given several options to work through.

Once the environment has been created, you'll need to go to the database security group (if you are using AWS RDS) and add the EB security group as an inbound rule for PostgreSQL. The easiest way of finding the EB security group, is to look up the configuration option within EB for the Security Group name, and then look up the security group ID in the EC2 management console.

!!! warning "Security Groups and VPCs"

    You will need to make sure that the database is deployed in a VPC which the elastic beanstalk instance can access. If it isn't, you won't be able to add the EB security group to the DB security group.
