# apps/dining/views.py

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import filters as drf_filters
from rest_framework import generics
from rest_framework.permissions import AllowAny

from apps.accounts.permissions import IsAdminOrStaff

from .filters import FoodItemFilter
from .models import DishType, FoodCategory, FoodItem
from .serializers import (
    DishTypeSerializer,
    FoodCategorySerializer,
    FoodItemSerializer,
)


class FoodCategoryListView(generics.ListAPIView):
    """
    Public API endpoint for active food categories.

    Examples:
    /api/v1/dining/categories/
    /api/v1/dining/categories/?food_type=veg
    /api/v1/dining/categories/?food_type=non_veg
    """

    serializer_class = FoodCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = FoodCategory.objects.filter(
            is_active=True,
        ).order_by(
            "display_order",
            "name",
        )

        food_type = self.request.query_params.get("food_type")

        if food_type:
            queryset = queryset.filter(
                food_type__iexact=food_type,
            )

        return queryset


class DishTypeListView(generics.ListAPIView):
    """
    Public API endpoint for active dish types.

    Example:
    /api/v1/dining/dish-types/
    """

    serializer_class = DishTypeSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    queryset = DishType.objects.filter(
        is_active=True,
    ).order_by(
        "display_order",
        "name",
    )


class FoodItemListView(generics.ListAPIView):
    """
    Public food listing endpoint.

    Supported filters:

    /api/v1/dining/foods/?food_type=veg
    /api/v1/dining/foods/?food_type=non_veg
    /api/v1/dining/foods/?category=4
    /api/v1/dining/foods/?dish_type=1
    /api/v1/dining/foods/?is_featured=true
    /api/v1/dining/foods/?min_price=100
    /api/v1/dining/foods/?max_price=500
    /api/v1/dining/foods/?search=chicken
    /api/v1/dining/foods/?ordering=full_price
    /api/v1/dining/foods/?ordering=-full_price
    """

    serializer_class = FoodItemSerializer
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]

    filterset_class = FoodItemFilter

    search_fields = [
        "name",
        "description",
        "category__name",
        "dish_type__name",
    ]

    ordering_fields = [
        "name",
        "full_price",
        "half_price",
        "display_order",
        "created_at",
    ]

    ordering = [
        "category__display_order",
        "display_order",
        "name",
    ]

    def get_queryset(self):
        return (
            FoodItem.objects.filter(
                is_available=True,
                category__is_active=True,
            )
            .filter(Q(dish_type__isnull=True) | Q(dish_type__is_active=True))
            .select_related(
                "category",
                "dish_type",
            )
            .order_by(
                "category__display_order",
                "display_order",
                "name",
            )
        )


class FoodItemDetailView(generics.RetrieveAPIView):
    """
    Public food detail endpoint.

    Example:
    /api/v1/dining/foods/12/
    """

    serializer_class = FoodItemSerializer
    permission_classes = [AllowAny]
    lookup_field = "pk"

    def get_queryset(self):
        return (
            FoodItem.objects.filter(
                is_available=True,
                category__is_active=True,
            )
            .filter(Q(dish_type__isnull=True) | Q(dish_type__is_active=True))
            .select_related(
                "category",
                "dish_type",
            )
        )


class AdminFoodCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = FoodCategorySerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_fields = ["food_type", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["display_order", "name", "food_type"]
    ordering = ["display_order", "name"]

    def get_queryset(self):
        return FoodCategory.objects.all().order_by("display_order", "name")


class AdminFoodCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FoodCategorySerializer
    permission_classes = [IsAdminOrStaff]
    queryset = FoodCategory.objects.all()


class AdminDishTypeListCreateView(generics.ListCreateAPIView):
    serializer_class = DishTypeSerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name"]
    ordering_fields = ["display_order", "name"]
    ordering = ["display_order", "name"]

    def get_queryset(self):
        return DishType.objects.all().order_by("display_order", "name")


class AdminDishTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DishTypeSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = DishType.objects.all()


class AdminFoodItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_class = FoodItemFilter
    search_fields = ["name", "description", "category__name", "dish_type__name"]
    ordering_fields = [
        "name",
        "full_price",
        "half_price",
        "display_order",
        "created_at",
        "updated_at",
    ]
    ordering = ["category__display_order", "display_order", "name"]

    def get_queryset(self):
        return (
            FoodItem.objects.all()
            .select_related("category", "dish_type")
            .order_by("category__display_order", "display_order", "name")
        )


class AdminFoodItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [IsAdminOrStaff]
    queryset = FoodItem.objects.select_related("category", "dish_type")
