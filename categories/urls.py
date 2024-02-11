from django.urls import path
from . import views

urlpatterns = [
    path("get-user-categories/", views.category_list, name="category_list"),
    path("post-user-category/", views.post_user_category, name="post_user_category"),
    path(
        "delete-user-category/",
        views.delete_user_category,
        name="delete_user_category",
    ),
]
