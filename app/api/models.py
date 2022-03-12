import datetime

from django.db import models

from accounts.models import CustomUser


class ExampleDataTable(models.Model):
    # Types of field available can be found here:
    # https://docs.djangoproject.com/en/3.2/ref/models/fields/
    # Useful options for fields include:
    # - blank: allow blank values
    # - choices: predefine choices available in the field
    # - db_column: manually override the column name in the db
    # - db_index: add a db index to the field
    # - default: add a default value
    # - null: store blank values in the db as NULL
    # - primary_key: specify a specific column to be the pk rather than Django
    # automatically creating one for you
    # - unique: field must be unique
    # - unique_for_date: field must be unique for a date (see also month/year)
    # - verbose_name: human-readable name override
    # - validators: validators for the field
    # - help_text: help text to provide to the user in the admin panel

    name = models.CharField(max_length=100)
    email = models.EmailField(
        max_length=100, help_text="How to contact the person"
    )
    message = models.CharField(max_length=500, blank=True, null=True)
    # Update once when created
    created_at = models.DateTimeField(auto_now_add=True)
    # Update whenever modified
    last_updated_at = models.DateTimeField(auto_now=True)

    # Example multiple-choice field
    # This is only valid through the in-built Django forms e.g. the admin panel
    MORNING = "morning"
    AFTERNOON = "afternoon"
    NIGHT = "night"
    DAY_CHOICES = [
        (MORNING, "After 6am, Before 12pm"),
        (AFTERNOON, "Between 12pm and 6pm"),
        (NIGHT, "Between 6am and 6pm"),
    ]
    part_of_day_created = models.CharField(
        max_length=50, choices=DAY_CHOICES, default=MORNING
    )

    # Foreign Key
    owner = models.ForeignKey(
        # Model this field links to
        CustomUser,
        # How to refer to the objects in this table when working with the
        # related object e.g. user.examples
        related_name="examples",
        # What to do if the 'parent' is deleted
        on_delete=models.CASCADE,
        null=True,
    )

    class Meta:
        # These are some useful options, but all options can be found here:
        # https://docs.djangoproject.com/en/3.2/ref/models/options/

        # Human readable name for the object (e.g in Admin)
        verbose_name = "example data"
        verbose_name_plural = "example data"

        # Default sort order
        ordering = ("-created_at", "name")
        get_latest_by = "created_at"

        # # Don't allow django to edit the database table
        # managed = False

        # # If the table name and schema are required
        # db_table = 'data_schema\".\"table_name'

        # # If you need to be able to quickly search on a field combo or result
        # # https://docs.djangoproject.com/en/3.2/ref/models/indexes/
        # indexes = [
        #     models.Index(fields=['email', 'message']),
        # ]

        # # Define a unique constraint on multiple fields
        # unique_together = ['email', 'owner']

    # String method - what is 'printed' when looking at the object
    def __str__(self):
        return f"{self.email} ({self.created_at})"

    # Additional method on this table i.e. data not stored in the database
    # but still accessible to Django
    def email_domain(self):
        return self.email.split("@")[1].split(".")[0]

    # Sometimes, you may want to populate the table with additional details
    # which are hard to provide as a 'default' value. In this case, we need
    # to overwrite the `save` method.
    # Note: this example is quite contrived, and doesn't include several
    # things that would need to be considered e.g. localtime, but hopefully
    # gives a good impression
    def save(self, *args, **kwargs):

        now = datetime.datetime.now().time()
        if now.hour >= 6 and now.hour < 12:
            self.part_of_day_created = "morning"
        elif now.hour >= 12 and now.hour < 18:
            self.part_of_day_created = "afternoon"
        else:
            self.part_of_day_created = "night"
        return super().save(*args, **kwargs)
