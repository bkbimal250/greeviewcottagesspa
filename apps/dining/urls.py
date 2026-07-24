from django.urls import path

from apps.dining.views import (
    AdminDishTypeDetailView,
    AdminDishTypeListCreateView,
    AdminFoodCategoryDetailView,
    AdminFoodCategoryListCreateView,
    AdminFoodItemDetailView,
    AdminFoodItemListCreateView,
    DishTypeListView,
    FoodCategoryListView,
    FoodItemDetailView,
    FoodItemListView,
)

app_name = "dining"

urlpatterns = [
    path("dining/categories/", FoodCategoryListView.as_view(), name="food-category-list"),
    path("dining/dish-types/", DishTypeListView.as_view(), name="dish-type-list"),
    path("dining/foods/", FoodItemListView.as_view(), name="food-list"),
    path("dining/foods/<int:pk>/", FoodItemDetailView.as_view(), name="food-detail"),
    path(
        "admin/dining/categories/",
        AdminFoodCategoryListCreateView.as_view(),
        name="admin-food-category-list",
    ),
    path(
        "admin/dining/categories/<int:pk>/",
        AdminFoodCategoryDetailView.as_view(),
        name="admin-food-category-detail",
    ),
    path(
        "admin/dining/dish-types/",
        AdminDishTypeListCreateView.as_view(),
        name="admin-dish-type-list",
    ),
    path(
        "admin/dining/dish-types/<int:pk>/",
        AdminDishTypeDetailView.as_view(),
        name="admin-dish-type-detail",
    ),
    path(
        "admin/dining/foods/",
        AdminFoodItemListCreateView.as_view(),
        name="admin-food-list",
    ),
    path(
        "admin/dining/foods/<int:pk>/",
        AdminFoodItemDetailView.as_view(),
        name="admin-food-detail",
    ),
]
