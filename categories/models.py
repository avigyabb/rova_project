from django.db import models


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    user_id = models.IntegerField()


class SessionCategory(models.Model):
    session_id = models.IntegerField()
    category_id = models.IntegerField()


def __str__(self):
    return self.name
