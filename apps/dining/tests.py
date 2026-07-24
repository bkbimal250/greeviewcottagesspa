from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.dining.models import DishType, FoodCategory, FoodItem, FoodType


class DiningPublicApiTests(APITestCase):
    def setUp(self):
        self.veg_category = FoodCategory.objects.create(
            name="Starters",
            food_type=FoodType.VEG,
            display_order=1,
        )
        self.non_veg_category = FoodCategory.objects.create(
            name="Starters",
            food_type=FoodType.NON_VEG,
            display_order=2,
        )
        self.inactive_category = FoodCategory.objects.create(
            name="Hidden",
            food_type=FoodType.VEG,
            is_active=False,
        )
        self.dish_type = DishType.objects.create(name="Indian")
        self.inactive_dish_type = DishType.objects.create(
            name="Hidden Style",
            is_active=False,
        )
        self.food_item = FoodItem.objects.create(
            name="Paneer Tikka",
            category=self.veg_category,
            dish_type=self.dish_type,
            full_price="240.00",
            half_price="140.00",
            image_list=["/media/dining/paneer.webp"],
            description="Fresh cottage-style starter.",
            is_featured=True,
        )
        FoodItem.objects.create(
            name="Chicken Tikka",
            category=self.non_veg_category,
            full_price="320.00",
        )
        FoodItem.objects.create(
            name="Hidden Dish",
            category=self.inactive_category,
            full_price="100.00",
        )
        FoodItem.objects.create(
            name="Inactive Dish Type Food",
            category=self.veg_category,
            dish_type=self.inactive_dish_type,
            full_price="120.00",
        )

    def test_category_list_returns_only_active_categories(self):
        response = self.client.get(reverse("dining:food-category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {item["name"] for item in response.data}
        self.assertEqual(names, {"Starters"})

    def test_food_list_filters_by_food_type_and_hides_inactive_relations(self):
        response = self.client.get(
            reverse("dining:food-list"),
            {"food_type": FoodType.VEG},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data
        if isinstance(payload, dict) and "data" in payload:
            results = payload["data"].get("results", payload["data"])
        elif isinstance(payload, dict):
            results = payload.get("results", payload)
        else:
            results = payload
        names = {item["name"] for item in results}
        self.assertEqual(names, {"Paneer Tikka"})

    def test_food_detail_includes_display_fields(self):
        response = self.client.get(
            reverse("dining:food-detail", kwargs={"pk": self.food_item.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Paneer Tikka")
        self.assertEqual(response.data["category_name"], "Starters")
        self.assertEqual(response.data["dish_type_name"], "Indian")
        self.assertEqual(response.data["primary_image"], "/media/dining/paneer.webp")
