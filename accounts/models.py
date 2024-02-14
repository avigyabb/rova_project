from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class RovaUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Add your custom fields here

    # You can add more fields as needed

    def __str__(self):
        return self.user.username