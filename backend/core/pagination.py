from rest_framework.pagination import PageNumberPagination


class PageNumberWithSizePagination(PageNumberPagination):
    """Default 12 per page; clients may ask for up to 100 with ``?page_size=``."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100
