from django.urls import include, path, re_path
from knox import views as knox_views

from accounts.api import ActivateAccountAPI, LoginAPI, RegisterAPI, UserAPI

urlpatterns = [
    path("register", RegisterAPI.as_view()),
    path("login", LoginAPI.as_view()),
    path("user", UserAPI.as_view()),
    path("logout", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("activate", ActivateAccountAPI.as_view()),
    re_path(
        r"^password-reset/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
]
