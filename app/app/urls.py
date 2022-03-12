from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic.base import RedirectView

handler404 = "frontend.views.redirect_view_to_frontend"

urlpatterns = [
    path("", include("frontend.urls")),  # Main react app entry point
    path(
        "favicon.ico",
        RedirectView.as_view(url=settings.STATIC_URL + "favicon.ico"),
    ),  # Don't fail finding the favicon
    path("admin/", admin.site.urls),  # Default admin panel
    path("api/v1/", include("api.urls")),  # Main data API urls
    path("api/v1/auth/", include("accounts.urls")),  # Main auth API urls
]

# In debug mode, serve the media files
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
