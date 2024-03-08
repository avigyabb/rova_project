from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    auto_generated = models.BooleanField(default=True)
    threshold = models.FloatField(default=1) # Threshold for user-defined categories
    cluster_id = models.IntegerField(default=-2) # Cluster ID for auto-suggested category
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SessionCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.IntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # Changed from category_id

