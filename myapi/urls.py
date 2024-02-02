from django.urls import path
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('get-paths/', views.get_paths, name='get_paths'),
    path('get-sessions/', views.get_sessions, name='get_sessions'),
    path('get-user/', views.get_user, name='get_user'),
    path('get-fpaths/', views.get_fpaths, name='filter_paths'),
]