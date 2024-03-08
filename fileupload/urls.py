from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.file_upload, name='file_upload'),
    path('download/<int:file_id>/', views.file_download, name='file_download'),
]
