from rest_framework import serializers

from apps.common.services.image_upload import upload_image_to_s3
from apps.common.validators import validate_image_file
from apps.cottages.models import Cottage, CottageAvailabilityHold, CottageBlock
from apps.cottages.services import AvailabilityService


class CottageListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Cottage
        fields = (
            "id",
            "property",
            "property_name",
            "name",
            "slug",
            "cottage_code",
            "room_type",
            "bed_type",
            "short_description",
            "view_type",
            "maximum_guests",
            "maximum_adults",
            "maximum_children",
            "base_price",
            "saturday_price",
            "sunday_price",
            "tax_percentage",
            "thumbnail",
            "amenities",
            "status",
            "is_featured",
            "sort_order",
        )
        read_only_fields = fields


class CottageDetailSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Cottage
        exclude = ("admin_notes",)
        read_only_fields = tuple(field.name for field in Cottage._meta.fields)


class CottageAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cottage
        fields = "__all__"
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def validate(self, attrs):
        instance = self.instance or Cottage()
        for field, value in attrs.items():
            setattr(instance, field, value)
        instance.clean()
        return attrs


class CottageBlockSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source="cottage.name", read_only=True)

    class Meta:
        model = CottageBlock
        fields = (
            "id",
            "cottage",
            "cottage_name",
            "start_date",
            "end_date",
            "block_type",
            "reason",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "created_at", "updated_at")

    def validate(self, attrs):
        instance = self.instance or CottageBlock()
        for field, value in attrs.items():
            setattr(instance, field, value)
        instance.clean()
        return attrs


class AvailabilityQuerySerializer(serializers.Serializer):
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    adults = serializers.IntegerField(min_value=1)
    children = serializers.IntegerField(min_value=0, default=0)

    def validate(self, attrs):
        AvailabilityService.validate_date_range(attrs["check_in"], attrs["check_out"])
        return attrs


class AvailableCottageSerializer(serializers.Serializer):
    cottage = CottageListSerializer()
    pricing = serializers.DictField()


class CottageHoldCreateSerializer(serializers.Serializer):
    cottage_id = serializers.UUIDField()
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    adults = serializers.IntegerField(min_value=1)
    children = serializers.IntegerField(min_value=0, default=0)
    guest_phone = serializers.CharField(required=False, allow_blank=True)
    guest_email = serializers.EmailField(required=False, allow_blank=True)

    def validate_cottage_id(self, value):
        if not Cottage.objects.filter(id=value).exists():
            raise serializers.ValidationError("Cottage does not exist.")
        return value

    def create(self, validated_data):
        cottage = Cottage.objects.get(id=validated_data["cottage_id"])
        return AvailabilityService.create_24_hour_hold(
            cottage=cottage,
            check_in=validated_data["check_in"],
            check_out=validated_data["check_out"],
            adults=validated_data["adults"],
            children=validated_data["children"],
            guest_phone=validated_data.get("guest_phone", ""),
            guest_email=validated_data.get("guest_email", ""),
        )


class CottageHoldSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source="cottage.name", read_only=True)

    class Meta:
        model = CottageAvailabilityHold
        fields = (
            "id",
            "cottage",
            "cottage_name",
            "check_in_date",
            "check_out_date",
            "guest_phone",
            "guest_email",
            "status",
            "expires_at",
            "released_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CottageImageUploadSerializer(serializers.Serializer):
    IMAGE_TYPE_CHOICES = (
        ("thumbnail", "Thumbnail"),
        ("cover", "Cover"),
        ("beds", "Beds"),
        ("bathrooms", "Bathrooms"),
        ("interiors", "Interiors"),
        ("exteriors", "Exteriors"),
        ("gallery", "Gallery"),
    )

    image_type = serializers.ChoiceField(choices=IMAGE_TYPE_CHOICES)
    image = serializers.ImageField(validators=[validate_image_file])

    def save(self, **kwargs):
        cottage: Cottage = self.context["cottage"]
        image_type = self.validated_data["image_type"]
        image = self.validated_data["image"]

        uploaded_image = upload_image_to_s3(
            image_file=image,
            property_id=cottage.property_id,
            image_type=image_type,
            cottage_id=cottage.id,
        )
        image_key = uploaded_image["key"]
        image_url = uploaded_image["url"]

        single_image_fields = {
            "thumbnail": "thumbnail",
            "cover": "cover_image",
        }
        gallery_fields = {
            "beds": "bed_images",
            "bathrooms": "bathroom_images",
            "interiors": "interior_images",
            "exteriors": "exterior_images",
            "gallery": "gallery_images",
        }

        if image_type in single_image_fields:
            field_name = single_image_fields[image_type]
            setattr(cottage, field_name, image_key)
            cottage.save(update_fields=[field_name, "updated_at"])
        elif image_type in gallery_fields:
            field_name = gallery_fields[image_type]
            current_images = list(getattr(cottage, field_name) or [])
            if image_url not in current_images:
                current_images.append(image_url)
                setattr(cottage, field_name, current_images)
                cottage.save(update_fields=[field_name, "updated_at"])

        return {
            "image_type": image_type,
            "path": image_key,
            "url": image_url,
        }
