# apps/dining/filters.py

from django_filters import rest_framework as filters

from .models import FoodItem


class FoodItemFilter(filters.FilterSet):
    category = filters.NumberFilter(field_name="category_id")
    dish_type = filters.NumberFilter(field_name="dish_type_id")

    food_type = filters.CharFilter(
        field_name="food_type",
        lookup_expr="iexact",
    )

    is_available = filters.BooleanFilter(
        field_name="is_available",
    )

    is_featured = filters.BooleanFilter(
        field_name="is_featured",
    )

    min_price = filters.NumberFilter(
        method="filter_min_price",
    )

    max_price = filters.NumberFilter(
        method="filter_max_price",
    )

    class Meta:
        model = FoodItem
        fields = [
            "category",
            "dish_type",
            "food_type",
            "is_available",
            "is_featured",
        ]

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(full_price__gte=value)

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(full_price__lte=value)
