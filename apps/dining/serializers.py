# apps/dining/serializers.py

from rest_framework import serializers

from .models import DishType, FoodCategory, FoodItem


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = [
            "id",
            "name",
            "food_type",
            "is_active",
            "display_order",
        ]


class DishTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DishType
        fields = [
            "id",
            "name",
            "is_active",
            "display_order",
        ]


class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    dish_type_name = serializers.CharField(source="dish_type.name", read_only=True)
    primary_image = serializers.CharField(read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            "id",
            "name",
            "food_type",
            "category",
            "category_name",
            "dish_type",
            "dish_type_name",
            "full_price",
            "half_price",
            "primary_image",
            "image_list",
            "description",
            "is_available",
            "is_featured",
            "display_order",
        ]
        read_only_fields = ["food_type"]

    def validate_image_list(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Image list must be an array."
            )

        for image_url in value:
            if not isinstance(image_url, str) or not image_url.strip():
                raise serializers.ValidationError(
                    "Every image must be a valid image URL."
                )

        return value

    def validate(self, attrs):
        category = attrs.get(
            "category",
            getattr(self.instance, "category", None),
        )

        half_price = attrs.get(
            "half_price",
            getattr(self.instance, "half_price", None),
        )

        full_price = attrs.get(
            "full_price",
            getattr(self.instance, "full_price", None),
        )

        if category and not category.is_active:
            raise serializers.ValidationError(
                {"category": "Selected category is inactive."}
            )

        if (
            half_price is not None
            and full_price is not None
            and half_price >= full_price
        ):
            raise serializers.ValidationError(
                {
                    "half_price": (
                        "Half price must be lower than full price."
                    )
                }
            )

        return attrs
