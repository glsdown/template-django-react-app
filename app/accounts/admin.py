from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

# Register your models here.
from accounts.models import CustomUser, Profile


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"
    fields = [
        "title",
        "job_title",
        "email_confirmed",
    ]


class CustomUserAdmin(UserAdmin):
    inlines = [ProfileInline]
    ordering = ["email"]
    # What to show in the list view
    list_display = [
        "email",
        "get_title",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
    ]
    # Show a related field in the list view
    list_select_related = ["profile"]

    # Split up the view into sections
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password", "password2"),
            },
        ),
    )

    # Example demonstrating how to show a related field in the list view
    def get_title(self, instance):
        if instance.profile.title:
            return instance.profile.title
        return None

    get_title.short_description = "Title"

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


admin.site.register(CustomUser, CustomUserAdmin)
