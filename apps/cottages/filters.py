import django_filters

from apps.cottages.models import Cottage, CottageBlock


class CottageFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")
    min_guests = django_filters.NumberFilter(field_name="maximum_guests", lookup_expr="gte")

    class Meta:
        model = Cottage
        fields = (
            "property",
            "status",
            "is_featured",
            "room_type",
            "bed_type",
            "min_price",
            "max_price",
            "min_guests",
        )


class CottageBlockFilter(django_filters.FilterSet):
    start_date_from = django_filters.DateFilter(field_name="start_date", lookup_expr="gte")
    end_date_to = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")

    class Meta:
        model = CottageBlock
        fields = ("cottage", "block_type", "start_date_from", "end_date_to")
