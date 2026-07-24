from rest_framework import serializers

from apps.common.services.image_upload import upload_image_to_media
from apps.common.validators import validate_image_file
from apps.properties.models import Property


class PropertyPublicSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(read_only=True)
    public_email = serializers.CharField(read_only=True)
    public_phone = serializers.CharField(read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "name",
            "slug",
            "property_code",
            "property_type",
            "tagline",
            "short_description",
            "description",
            "address_line_1",
            "address_line_2",
            "locality",
            "landmark",
            "city",
            "district",
            "state",
            "country",
            "pincode",
            "google_plus_code",
            "latitude",
            "longitude",
            "google_maps_url",
            "primary_phone",
            "secondary_phone",
            "whatsapp_number",
            "email",
            "reservation_email",
            "public_email",
            "public_phone",
            "website_url",
            "instagram_url",
            "facebook_url",
            "check_in_time",
            "check_out_time",
            "reception_open_time",
            "reception_close_time",
            "logo",
            "thumbnail",
            "cover_image",
            "exterior_images",
            "reception_images",
            "garden_images",
            "common_area_images",
            "gallery_images",
            "facilities",
            "nearby_places",
            "house_rules",
            "cancellation_policy",
            "refund_policy",
            "child_policy",
            "pet_policy",
            "extra_guest_policy",
            "damage_policy",
            "early_check_in_policy",
            "late_check_out_policy",
            "minimum_check_in_age",
            "id_proof_required",
            "local_id_allowed",
            "unmarried_couples_allowed",
            "visitors_allowed",
            "pets_allowed",
            "smoking_allowed",
            "alcohol_allowed",
            "outside_food_allowed",
            "children_allowed",
            "children_free_below_age",
            "quiet_hours_start",
            "quiet_hours_end",
            "booking_enabled",
            "same_day_booking_allowed",
            "minimum_stay_nights",
            "maximum_stay_nights",
            "maximum_advance_booking_days",
            "minimum_advance_booking_hours",
            "pay_at_property_allowed",
            "online_payment_enabled",
            "currency",
            "default_tax_percentage",
            "tax_included_in_price",
            "advance_payment_required",
            "advance_payment_percentage",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "canonical_url",
            "status",
            "full_address",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class PropertyAdminListSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "name",
            "slug",
            "property_code",
            "property_type",
            "city",
            "state",
            "primary_phone",
            "reservation_email",
            "booking_enabled",
            "status",
            "thumbnail",
            "full_address",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "full_address", "created_at", "updated_at")


PROPERTY_ADMIN_FIELDS = tuple(field.name for field in Property._meta.fields) + (
    "full_address",
    "public_email",
    "public_phone",
)


class PropertyAdminSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(read_only=True)
    public_email = serializers.CharField(read_only=True)
    public_phone = serializers.CharField(read_only=True)

    class Meta:
        model = Property
        fields = PROPERTY_ADMIN_FIELDS
        read_only_fields = (
            "id",
            "slug",
            "full_address",
            "public_email",
            "public_phone",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        instance = self.instance or Property()
        for field, value in attrs.items():
            setattr(instance, field, value)
        instance.clean()
        return attrs


class PropertyImageUploadSerializer(serializers.Serializer):
    class ImageType:
        LOGO = "logo"
        THUMBNAIL = "thumbnail"
        COVER = "cover"
        EXTERIOR = "exterior"
        RECEPTION = "reception"
        GARDEN = "garden"
        COMMON_AREA = "common_area"
        GALLERY = "gallery"

    IMAGE_TYPE_CHOICES = (
        (ImageType.LOGO, "Logo"),
        (ImageType.THUMBNAIL, "Thumbnail"),
        (ImageType.COVER, "Cover"),
        (ImageType.EXTERIOR, "Exterior"),
        (ImageType.RECEPTION, "Reception"),
        (ImageType.GARDEN, "Garden"),
        (ImageType.COMMON_AREA, "Common Area"),
        (ImageType.GALLERY, "Gallery"),
    )

    image_type = serializers.ChoiceField(choices=IMAGE_TYPE_CHOICES)
    image = serializers.ImageField(validators=[validate_image_file])

    def save(self, **kwargs):
        property_obj: Property = self.context["property"]
        image_type = self.validated_data["image_type"]
        image = self.validated_data["image"]

        uploaded_image = upload_image_to_media(
            image_file=image,
            property_id=property_obj.id,
            image_type=image_type,
        )
        image_key = uploaded_image["key"]
        image_url = uploaded_image["url"]

        single_image_fields = {
            self.ImageType.LOGO: "logo",
            self.ImageType.THUMBNAIL: "thumbnail",
            self.ImageType.COVER: "cover_image",
        }
        gallery_fields = {
            self.ImageType.EXTERIOR: "exterior_images",
            self.ImageType.RECEPTION: "reception_images",
            self.ImageType.GARDEN: "garden_images",
            self.ImageType.COMMON_AREA: "common_area_images",
            self.ImageType.GALLERY: "gallery_images",
        }

        if image_type in single_image_fields:
            field_name = single_image_fields[image_type]
            setattr(property_obj, field_name, image_key)
            property_obj.save(update_fields=[field_name, "updated_at"])
        elif image_type in gallery_fields:
            field_name = gallery_fields[image_type]
            current_images = list(getattr(property_obj, field_name) or [])
            if image_url not in current_images:
                current_images.append(image_url)
                setattr(property_obj, field_name, current_images)
                property_obj.save(update_fields=[field_name, "updated_at"])

        return {
            "image_type": image_type,
            "path": image_key,
            "url": image_url,
        }
