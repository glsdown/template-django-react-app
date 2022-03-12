from rest_framework import serializers

from api.models import ExampleDataTable


# ExampleDataTable serializer
class ExampleDataTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExampleDataTable
        fields = ["id", "name", "email", "message", "created_at", "owner"]
