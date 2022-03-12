from rest_framework import routers

from api.api import ExampleDataTableViewSet

router = routers.DefaultRouter()
router.register("examples", ExampleDataTableViewSet, "examples")

urlpatterns = router.urls
