from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.accounts.models import LoginOTP, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    ordering = ("email",)
    list_display = ("email", "phone", "full_name", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "full_name", "phone")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal information", {"fields": ("full_name", "phone", "role")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "phone",
                    "role",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")


@admin.register(LoginOTP)
class LoginOTPAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "channel",
        "destination",
        "expires_at",
        "consumed_at",
        "attempts",
        "created_at",
    )
    list_filter = ("channel", "consumed_at", "expires_at")
    search_fields = ("user__email", "user__phone", "destination")
    readonly_fields = (
        "id",
        "user",
        "channel",
        "destination",
        "otp_hash",
        "expires_at",
        "consumed_at",
        "attempts",
        "max_attempts",
        "created_at",
        "updated_at",
    )
