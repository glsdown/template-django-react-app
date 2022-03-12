from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

# Required if you want to return all, and not just those relating to the
# logged in user
# from api.models import ExampleDataTable
from api.serializers import ExampleDataTableSerializer
from app.pagination import CustomPagination


# ExampleDataTable Viewset
class ExampleDataTableViewSet(viewsets.ModelViewSet):
    """
    Methods to extract and modify the example data.

    list: Extract all the data in the example data table for the logged in \
        user.

    create: Add a new entry to the example data table.

    retrieve: Extract a single entry from the example data table based on a \
        given ID.

    update: Fully update all details for an entry in the example table based \
        on a given ID.

    partialUpdate: Partially update data from the example table based on a \
        given ID

    destroy: Delete data from the example table based on a given ID
    """

    # Force user to be authenticated to access
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExampleDataTableSerializer
    pagination_class = CustomPagination

    # Searching and filtering
    filter_backends = [DjangoFilterBackend, SearchFilter]
    # Filter the data set by adding the parameter ?email="example@example.com"
    filterset_fields = ["email"]
    # Search the dataset using the SEARCH_PARAM e.g. ?search="hi"
    # By default, uses case-insensitive partial matches. The search parameter
    # may contain multiple search terms, which should be whitespace and/or
    # comma separated. If multiple search terms are used then objects will
    # be returned in the list only if all the provided terms are matched.
    # The search behavior may be restricted by prepending various characters
    # to the search_fields.
    #   '^' Starts-with search.
    #   '=' Exact matches.
    #   '@' Full-text search. (Currently only supported PostgreSQL)
    #   '$' Regex search.
    search_fields = ["message", "owner__profile__job_title"]
    # Notes: The search_field "owner__profile__job_title" doesn't make sense
    # here as we only ever return the logged in users' results, but is here
    # for reference on searching on related fields

    # In here you can extract just the required dataset quickly and easily
    # This is where you would make amendments to the queryset that needed
    # to be included in all results. For example here, the queryset relates
    # only to the examples belonging to the current user.
    # You could additionally filter based on query params as required if the
    # search and filter above doesn't do what is required.
    # It is also where you would make use of prefetch to speed up the results.
    # CustomUser.objects.prefetch_related("examples")
    def get_queryset(self):
        # Return all examples
        # return ExampleDataTable.objects.all()
        # Only return examples relating to the user
        return self.request.user.examples.all()

    # Example overwriting the list response to include pagination
    def list(self, response):
        # Get the queryset
        queryset = self.get_queryset()
        # Filter the queryset using the inbuilt methods
        queryset = self.filter_queryset(queryset)
        # Paginate the response
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        # Serialize the data if no page provided
        serializer = self.get_serializer(queryset, many=True)
        # Return the response
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
