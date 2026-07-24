from django.contrib import admin

from apps.dining.models import DishType, FoodCategory, FoodItem


@admin.register(FoodCategory)
class FoodCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "food_type", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    list_filter = ("food_type", "is_active")
    search_fields = ("name",)
    ordering = ("display_order", "name")


@admin.register(DishType)
class DishTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    list_filter = ("is_active",)
    search_fields = ("name",)
    ordering = ("display_order", "name")


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "food_type",
        "category",
        "dish_type",
        "full_price",
        "half_price",
        "is_available",
        "is_featured",
        "display_order",
        "updated_at",
    )
    list_display_links = ("name",)
    list_editable = (
        "full_price",
        "half_price",
        "is_available",
        "is_featured",
        "display_order",
    )
    list_filter = (
        "food_type",
        "category",
        "dish_type",
        "is_available",
        "is_featured",
    )
    search_fields = ("name", "description", "category__name", "dish_type__name")
    readonly_fields = ("food_type", "created_at", "updated_at", "primary_image")
    list_select_related = ("category", "dish_type")
    ordering = ("category__display_order", "display_order", "name")
    save_on_top = True
