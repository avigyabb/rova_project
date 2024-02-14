from django.contrib import admin
from .models import ListOfKPIs, SessionsToKPIs
# Register your models here.
admin.site.register(ListOfKPIs)
admin.site.register(SessionsToKPIs)