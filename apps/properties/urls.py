from django.urls import path

from apps.properties.views import (
    AdminPropertyDetailView,
    AdminPropertyImageUploadView,
    AdminPropertyListCreateView,
    PublicPropertyView,
)

app_name = "properties"

urlpatterns = [
    path("property/", PublicPropertyView.as_view(), name="public-property"),
    path("admin/property/", AdminPropertyListCreateView.as_view(), name="admin-property-list"),
    path(
        "admin/property/<uuid:pk>/", AdminPropertyDetailView.as_view(), name="admin-property-detail"
    ),
    path(
        "admin/property/<uuid:pk>/upload-image/",
        AdminPropertyImageUploadView.as_view(),
        name="admin-property-upload-image",
    ),
]
