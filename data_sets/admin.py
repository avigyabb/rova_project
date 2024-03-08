from django.contrib import admin
from .models import Dataset
from .models import SessionDataset

# Register your models here.
admin.site.register(Dataset)
admin.site.register(SessionDataset)
