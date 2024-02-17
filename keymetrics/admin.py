from django.contrib import admin
from .models import ListOfKPIs, SessionsToKPIs, SessionsToScores
# Register your models here.
admin.site.register(ListOfKPIs)
admin.site.register(SessionsToKPIs)
admin.site.register(SessionsToScores)