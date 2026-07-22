from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import (
    LogoutView,
    OTPRequestView,
    OTPVerifyView,
    ProfileView,
    StaffTokenObtainPairView,
)

app_name = "accounts"

urlpatterns = [
    path("login/", StaffTokenObtainPairView.as_view(), name="login"),
    path("request-otp/", OTPRequestView.as_view(), name="request-otp"),
    path("verify-otp/", OTPVerifyView.as_view(), name="verify-otp"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
