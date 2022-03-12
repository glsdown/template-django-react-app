# Adding S3 Resource Storage

There are a number of times when you might want to use S3 for storage rather than local storage. For example to add media storage for a field in a database table, or to store static files. This will walk you through the additional configuration required.

## Setup

!!! warning "Using elastic beanstalk"

    When using Elastic Beanstalk, you don't need to host the static files separately, and instead, EB will handle the file serving for you. All you need to do is to include this in your `.ebextensions/django.config` file:

    ```yml
    aws:elasticbeanstalk:environment:proxy:staticfiles:
        /static: static
    ```

    The options should remain set for local static files in your settings.py

    ```python
    # app/app/settings.py

    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage" # The default - so could be left out altogether
    STATIC_URL = "/static/"
    STATIC_ROOT = str(BASE_DIR.joinpath("static"))
    ```

### S3 Bucket

Create an S3 bucket using all the default settings.

If you want to use S3 for static file storage too, you will need to allow public access on your bucket. Once you have switched off the setting on the bucket to 'block all public access', apply this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::my-bucket-name/static/*"]
        }
    ]
}
```

If you are just hosting private media files, the S3 bucket you create does not need public access. Access to it is controlled via the access keys given to Django.

To create an IAM user with the right access to this bucket, you need to:

1. Create an IAM user with Programmatic access
2. Add this policy inline to the IAM user (make sure to change `my-bucket-name` to your bucket):
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:GetObjectAcl",
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:DeleteObject",
                    "s3:PutObjectAcl"
                ],
                "Resource": [
                    "arn:aws:s3:::my-bucket-name/*",
                    "arn:aws:s3:::my-bucket-name"
                ]
            }
        ]
    }
    ```
3. Make sure to keep the access key and secret access key safe as you'll need these.

### Packages

First, you need to set the app up to use the storages package to handle the file transfer. To do this, you need to update two files:

!!! example "Update the packages used"

    === "`app/requirements.in`"

        You'll need to install django-storages and boto3:

        ```zsh
        pip install django-storages boto3
        ```


        Make sure to include them in your `requirements.in` file too:

        ```python hl_lines="4 5"
        # app/requirements.in

        ...
        boto3
        django-storages
        ...
        ```

        and re-compile your `requirements.txt` document using

        ```zsh
        pip-compile app/requirements.in
        ```

    === "`app/app/settings.py`"

        Include `storages` within your list of INSTALLED_APPS in the Django settings.

        ```python hl_lines="4"
        # settings.py
        INSTALLED_APPS = [
            ...
            "storages",
            ...
        ]
        ```

### Environment variables

!!! example "Environment Variables"

    === "Local - Mac"

        If you are running it locally, you will need to export them to your current environment. This will create a temporary environment variable. It will only exist for that terminal session, but is available immediately.

        ```zsh
        export AWS_REGION_NAME='eu-west-2'
        export AWS_ACCESS_KEY_ID='ABCDFG123456789ABCDEFG'
        export AWS_SECRET_ACCESS_KEY='ABCDFG123456789ABCDEFG'
        export AWS_STORAGE_BUCKET_NAME='my-bucket-name'
        ```

        Check it's working by using:

        ```zsh
        echo ${AWS_REGION_NAME}
        ```

    === "Local - Windows"

        On Windows, you'll need to restart the command prompt for this change to to effect. If using the terminal in VSCode, this will include restarting VSCode itself.

        ```bat
        setx AWS_REGION_NAME 'eu-west-1a'
        setx AWS_ACCESS_KEY_ID 'ABCDFG123456789ABCDEFG'
        setx AWS_SECRET_ACCESS_KEY 'ABCDFG123456789ABCDEFG'
        setx AWS_STORAGE_BUCKET_NAME 'my-bucket-name'
        ```

        Check it's working by using:

        ```bat
        echo %AWS_REGION_NAME%
        ```

        If this doesn't work, you can use the `set` command instead of `setx` and this will create a temporary environment variable. It will only exist for that terminal session, but is available immediately.

        ```bat
        setx AWS_REGION_NAME eu-west-1a
        setx AWS_ACCESS_KEY_ID ABCDFG123456789ABCDEFG
        setx AWS_SECRET_ACCESS_KEY ABCDFG123456789ABCDEFG
        setx AWS_STORAGE_BUCKET_NAME my-bucket-name
        ```

    === "Elastic Beanstalk"

        Add these to your `.ebextensions/environment.config` file:

        ```yml
        AWS_REGION_NAME: eu-west-1a
        AWS_ACCESS_KEY_ID: ABCDFG123456789ABCDEFG
        AWS_SECRET_ACCESS_KEY: ABCDFG123456789ABCDEFG
        AWS_STORAGE_BUCKET_NAME: my-bucket-name
        ```

### Giving Django access

In your `settings.py` file, you now nees to update the settings to make use of these variables, and get the app ready to go.

```python
# app/app/settings.py

# Media storage (using AWS S3)
AWS_S3_REGION_NAME = os.environ.get("AWS_REGION_NAME", "eu-west-1")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "")
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
AWS_DEFAULT_ACL = None # Inherit the permissions from the bucket/folder
AWS_S3_SIGNATURE_VERSION = "s3v4"

# How long the object link is viewable for
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
AWS_QUERYSTRING_EXPIRE = 600
```

## Media Files

### Storage Backends

#### Private Media

To handle private media, we need to create a Storage backend. To do this, create a file in `app/app/storage_backends.py` with the following:

!!! example "Create a private storage backend"

    ```python
    # app/app/storage_backends.py
    from storages.backends.s3boto3 import S3Boto3Storage

    class PrivateMediaStorage(S3Boto3Storage):
        location = "private" # The folder name in the bucket
        default_acl = "private"
        file_overwrite = False
        custom_domain = False
    ```

Files in this bucket will be accessible via an expirable link (the expiry time is defined within settings).

#### Static Files

To handle public static files, a slightly different backend is required. In the same `storage_backends.py` file, you need to include:

!!! example "Create a public storage backend"

    ```python
    # app/app/storage_backends.py
    from storages.backends.s3boto3 import S3StaticStorage

    class StaticStorage(S3StaticStorage):
        location = "static"
    ```

### Django settings.py

#### Private Media

Change the media settings in your `app/app/settings.py` file to use this new backend.

You'll need to update the MEDIA_URL setting, and add the storage backend:

```diff
# app/app/settings.py
- MEDIA_URL = "/media/"
+ MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/private/"
+ DEFAULT_FILE_STORAGE = "app.storage_backends.PrivateMediaStorage"
```

#### Static Files

Change the static settings in your `app/app/settings.py` file to use the new backend.

You'll need to update add the storage backend:

```python
# app/app/settings.py

STATICFILES_STORAGE = "app.storage_backends.StaticStorage"
```

## Usage

### Collect Static Files

To collect and upload all static files to S3, you will need to run:

```zsh
python app/manage.py collectstatic --noinput
```

Django’s collect static can be very slow when you will use S3 as storage. For that, you can use Collectfast to make this faster. Install it using `pip install Collectfast`. Then update the `app/app/settings.py` like this:

```python hl_lines="3 6"
# app/app/settings.py

AWS_PRELOAD_METADATA = True
INSTALLED_APPS = (
    ...
    'collectfast',
    ...
)
```

Remember to include Collectfast in your `requirements-dev.txt` file if you are using it.

### Add file storage as a field

In your `models.py` file that contains the model you want to add the field to, add the PrivateMediaStorage import:

```python
# models.py

from app.storage_backends import PrivateMediaStorage
```

Then you can add it as a field, using the FileField built into Django:

```python hl_lines="6 7 8 9 10 11"
# models.py

class ExampleDataTable(models.Model):
    ...
    # Example using S3 Media storage
    data_file = models.FileField(
        storage=PrivateMediaStorage,
        null=True,
        blank=True,
        help_text="Max filesize: 15MB",
    )
    ...
```

Applying these changes by running:

```zsh
python app/manage.py makemigrations
python app/manage.py migrate
```

### Testing

You can check that everything has connected as expected by using the admin panel to upload a file. Simply run the Django server and visit [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin).

### API access

You can also use Django Rest Framework to create an API quickly that returns you the url of the required media.

!!! example "Backend api"

    === "app/api/serializers.py"

        ```python
        # app/api/serializers.py
        from rest_framework import serializers

        from api.models import ExampleDataTable

        class ExampleDataTableUrlSerializer(serializers.ModelSerializer):
            class Meta:
                model = ExampleDataTable
                fields = ["id", "data_file"]
        ```

    === "app/api/api.py"

        ```python
        # app/api/api.py
        from django_filters.rest_framework import DjangoFilterBackend
        from rest_framework import generics, permissions
        from rest_framework.response import Response

        from api.models import ExampleDataTable
        from api.serializers import ExampleDataTableUrlSerializer

        class ExampleDataTableUrlAPI(generics.ListAPIView):
            """
            Returns the file details
            """

            permission_classes = [
                permissions.IsAuthenticated,
            ]
            serializer_class = ExampleDataTableUrlSerializer
            queryset = ExampleDataTable.objects.all()
            filter_backends = [DjangoFilterBackend]
            filterset_fields = ["id"]

            def get_queryset(self):
                queryset = self.queryset
                queryset = self.filter_queryset(queryset)
                return queryset
        ```

    === "app/api/urls.py"

        ```python hl_lines="2 5 10"
        # app/api/urls.py
        from django.urls import path
        from rest_framework import routers

        from api.api import ExampleDataTableViewSet, ExampleDataTableUrlAPI

        router = routers.DefaultRouter()
        router.register("examples", ExampleDataTableViewSet, "examples")

        urlpatterns = [path("example-data", ExampleDataTableUrlAPI.as_view())]

        urlpatterns += router.urls
        ```

All results would be returned here by visiting `http://127.0.0.1:8000/api/v1/exampleData` or a single one using `http://127.0.0.1:8000/api/v1/exampleData?id=1`.

The response is a timed URL (the timeout is based on the setting AWS_QUERYSTRING_EXPIRE).

!!! example "Sample Response"

    ```json
    [
        {
            "id": 1,
            "data_file": "https://test-media-storage.s3.amazonaws.com/private/Basic_Wireframes_Wvjh71L.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARD3GBEGOH536VGFD%2F20210910%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210910T173840Z&X-Amz-Expires=600&X-Amz-SignedHeaders=host&X-Amz-Signature=0c5b403596f5061e663bf863aed72026fee52e6c6a991a3e275e990f27cc277b"
        }
    ]
    ```
