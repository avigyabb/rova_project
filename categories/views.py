from django.core import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category
import json


@api_view(["GET"])
def category_list(request):
    categories = Category.objects.all().order_by("date")
    data = serializers.serialize("json", categories)
    data = json.loads(data)
    return Response(data, content_type="application/json")


@api_view(["POST"])
def post_user_category(request):
    name = request.data.get("name")
    description = request.data.get("description")

    new_category = Category(name=name, description=description, user_id=0)
    new_category.save()

    return Response({"success": "Category created successfully."})


# Add a new category
# def add_category(name, description):
#     new_category = {
#         "name": name,
#         "description": description,
#         "session_ids": [],
#         "num_events": 0,
#         "trend": [],
#     }
#     new_category["session_ids"] = assign_session_ids_to_category(new_category)
#     new_category["num_events"] = llm_df[name].sum()
#     new_category["trend"] = get_trend_for_category("1D", new_category)
#     categories.append(new_category)
