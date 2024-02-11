from django.db import models

# Create your models here.
class KeyMetricTable(models.Model):
    name = models.TextField()
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    importance = models.TextField()
    summary = models.TextField()
    user_id = models.IntegerField()


class SessionKeyMetric(models.Model):
    session_id = models.IntegerField()
    keymetric_id = models.IntegerField()
    keymetric_name = models.TextField()