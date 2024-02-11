from django.contrib import admin
from .models import KeyMetricTable, SessionKeyMetric
# Register your models here.
admin.site.register(KeyMetricTable)
admin.site.register(SessionKeyMetric)