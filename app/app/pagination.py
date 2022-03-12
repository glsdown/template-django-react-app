from rest_framework import pagination
from rest_framework.response import Response

# This defines how API requests are paginated i.e. split up.
# There are several default pagination classes available, but this one has
# been customised to return additional information about the data set.
# https://docs.djangoproject.com/en/3.1/topics/pagination/


class CustomPagination(pagination.PageNumberPagination):
    page_size_query_param = "limit"

    def get_paginated_response(self, data):
        return Response(
            {
                "pagination": {
                    "previous": self.get_previous_link(),
                    "next": self.get_next_link(),
                    "count": self.page.paginator.count,
                    "current_page": self.page.number,
                    "total_pages": self.page.paginator.num_pages,
                    "items_on_page": len(data),
                },
                "results": data,
            }
        )
