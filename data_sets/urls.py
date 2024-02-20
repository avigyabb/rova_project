from django.urls import path
from . import views

urlpatterns = [
    path("add-new-dataset/", views.add_new_dataset, name = "add_new_dataset"),
    path("get-properties-for-datasets/", views.get_properties_for_datasets, name = "get_properties_for_datasets"),
    path("add-sessions-to-datasets/", views.add_sessions_to_datasets, name = "add_sessions_to_datasets"),
    path("get-session-data-given-dataset/", views.get_session_data_given_dataset, name = "get_session_data_given_dataset"),
]
