from django.db import models
from accounts.models import RovaUser
from django.contrib.auth.models import User

# Create your models here.
class ListOfKPIs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.TextField()
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    importance = models.TextField()
    summary = models.TextField()

class SessionsToKPIs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.IntegerField()
    keymetric_id = models.IntegerField()
    keymetric_name = models.TextField()

class SessionsToScores(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.IntegerField()
    kpi_score = models.IntegerField(null=True)
    user_score = models.IntegerField(null=True)
    ai_score = models.IntegerField(null=True)
    custom_score = models.TextField(null=True, default=str({}))