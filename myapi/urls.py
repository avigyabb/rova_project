from django.urls import path
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('get-sessions/', views.get_sessions, name='get_sessions'),
    path('get-user/', views.get_user, name='get_user'),
    path('get-fpaths/', views.get_fpaths, name='filter_paths'),
    path('get-histogram/', views.get_histogram, name='get_histogram'),
    path('get-metrics/', views.get_metrics, name='get_metrics'),
    path('get-processed-query/', views.get_processed_query, name='get_processed_query'),
    path('get-sessions-at-step/', views.get_sessions_at_step, name='get_sessions_at_step'),
    path("get-percentages/", views.get_percentages, name = "get_percentages"),
    path("get-options/", views.get_options, name = "get_options"),
    path("track/", views.track_event, name = "track_event"),
]