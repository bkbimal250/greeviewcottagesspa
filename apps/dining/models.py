# apps/dining/models.py

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class FoodType(models.TextChoices):
    VEG = "veg", "Veg"
    NON_VEG = "non_veg", "Non-Veg"


class FoodCategory(models.Model):
    name = models.CharField(max_length=120)

    food_type = models.CharField(
        max_length=20,
        choices=FoodType.choices,
        db_index=True,
    )

    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "Food Categories"
        constraints = [
            models.UniqueConstraint(
                fields=["name", "food_type"],
                name="unique_food_category_type",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.get_food_type_display()})"

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        super().save(*args, **kwargs)


class DishType(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Example: Indian, Chinese, Continental, Rajasthani",
    )

    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        super().save(*args, **kwargs)


class FoodItem(models.Model):
    name = models.CharField(max_length=160)

    food_type = models.CharField(
        max_length=20,
        choices=FoodType.choices,
        db_index=True,
    )

    category = models.ForeignKey(
        FoodCategory,
        on_delete=models.PROTECT,
        related_name="food_items",
    )

    dish_type = models.ForeignKey(
        DishType,
        on_delete=models.SET_NULL,
        related_name="food_items",
        null=True,
        blank=True,
    )

    full_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Regular or full portion price",
    )

    half_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Optional half portion price",
    )

    image_list = models.JSONField(
        default=list,
        blank=True,
        help_text="List of uploaded image URLs",
    )

    description = models.TextField(blank=True)

    is_available = models.BooleanField(
        default=True,
        db_index=True,
    )

    is_featured = models.BooleanField(
        default=False,
        db_index=True,
    )

    display_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = [
            "category__display_order",
            "display_order",
            "name",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "name"],
                name="unique_food_item_per_category",
            )
        ]

    def __str__(self):
        return self.name

    @property
    def primary_image(self):
        return self.image_list[0] if self.image_list else None

    def clean(self):
        super().clean()

        if self.category_id and self.food_type and self.food_type != self.category.food_type:
            raise ValidationError({"food_type": "Food type must match the selected category."})

        if self.half_price is not None and self.full_price is not None:
            if self.half_price >= self.full_price:
                raise ValidationError({"half_price": "Half price must be lower than full price."})

        if not isinstance(self.image_list, list):
            raise ValidationError({"image_list": "Image list must be an array."})

        for image_url in self.image_list:
            if not isinstance(image_url, str) or not image_url.strip():
                raise ValidationError({"image_list": "Every image must be a valid image URL."})

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        self.description = self.description.strip()
        self.image_list = [
            image.strip()
            for image in (self.image_list or [])
            if isinstance(image, str) and image.strip()
        ]

        if self.category_id:
            self.food_type = self.category.food_type

        self.full_clean()
        super().save(*args, **kwargs)
