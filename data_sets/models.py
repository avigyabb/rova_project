from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Dataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class SessionDataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.IntegerField()
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)  # Changed from category_id

