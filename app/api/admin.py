from django.contrib import admin

from .models import ExampleDataTable


class DataAdmin(admin.ModelAdmin):
    model = ExampleDataTable
    extra = 2
    search_fields = ["name", "email", "message"]
    list_display = ["name", "email", "message", "created_at"]
    ordering = ["created_at"]


admin.site.register(ExampleDataTable, DataAdmin)
