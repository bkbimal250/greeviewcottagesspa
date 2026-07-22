from django.urls import path

from apps.cottages.views import (
    AdminCottageBlockDetailView,
    AdminCottageBlockListCreateView,
    AdminCottageDetailView,
    AdminCottageImageUploadView,
    AdminCottageListCreateView,
    AvailableCottageView,
    CottageAvailabilityCalendarView,
    CottageDetailView,
    CottageHoldCreateView,
    CottageListView,
)

app_name = "cottages"

urlpatterns = [
    path("cottages/", CottageListView.as_view(), name="cottage-list"),
    path("cottages/available/", AvailableCottageView.as_view(), name="cottage-available"),
    path("cottages/hold/", CottageHoldCreateView.as_view(), name="cottage-hold"),
    path(
        "cottages/<slug:slug>/availability-calendar/",
        CottageAvailabilityCalendarView.as_view(),
        name="cottage-availability-calendar",
    ),
    path("cottages/<slug:slug>/", CottageDetailView.as_view(), name="cottage-detail"),
    path("admin/cottages/", AdminCottageListCreateView.as_view(), name="admin-cottage-list"),
    path(
        "admin/cottages/<uuid:pk>/", AdminCottageDetailView.as_view(), name="admin-cottage-detail"
    ),
    path(
        "admin/cottages/<uuid:pk>/upload-image/",
        AdminCottageImageUploadView.as_view(),
        name="admin-cottage-upload-image",
    ),
    path(
        "admin/cottage-blocks/", AdminCottageBlockListCreateView.as_view(), name="admin-block-list"
    ),
    path(
        "admin/cottage-blocks/<uuid:pk>/",
        AdminCottageBlockDetailView.as_view(),
        name="admin-block-detail",
    ),
]
