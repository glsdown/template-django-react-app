from django.shortcuts import redirect, render


def index(request):
    return render(request, "frontend/index.html")


def redirect_view_to_frontend(request, exception):
    response = redirect("/#/not-found")
    return response
