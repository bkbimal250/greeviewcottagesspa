from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.services import AuthService


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD
    identifier = serializers.CharField(required=False, write_only=True)
    email = serializers.EmailField(required=False, write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"].required = False

    def validate(self, attrs):
        identifier = attrs.get("identifier") or attrs.get("email")
        if not identifier:
            raise serializers.ValidationError("Email or phone number is required.")

        user = AuthService.get_staff_user_by_identifier(identifier)
        credentials = {
            "email": user.email,
            "password": attrs.get("password"),
        }
        authenticated_user = authenticate(**credentials)
        if authenticated_user is None:
            raise serializers.ValidationError("Invalid login credentials.")

        refresh = self.get_token(authenticated_user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserProfileSerializer(authenticated_user).data,
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "last_login",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "is_active",
            "is_staff",
            "last_login",
            "created_at",
            "updated_at",
        )


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


class OTPRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField()

    def create(self, validated_data):
        login_otp, raw_otp = AuthService.create_login_otp(validated_data["identifier"])
        response = {
            "otp_id": login_otp.id,
            "channel": login_otp.channel,
            "destination": login_otp.destination,
            "expires_at": login_otp.expires_at,
        }
        if self.context.get("include_debug_otp"):
            response["debug_otp"] = raw_otp
        return response


class OTPVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    otp = serializers.CharField(min_length=4, max_length=10, trim_whitespace=True)

    def validate(self, attrs):
        user = AuthService.verify_login_otp(attrs["identifier"], attrs["otp"])
        refresh = RefreshToken.for_user(user)
        attrs["tokens"] = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserProfileSerializer(user).data,
        }
        return attrs
