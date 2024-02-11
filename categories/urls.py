from django.urls import path
from . import views

urlpatterns = [
    path("get-user-categories/", views.category_list, name="category_list"),
    path("post-user-category/", views.post_user_category, name="post_user_category"),
]
