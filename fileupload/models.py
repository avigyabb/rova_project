from django.db import models
from django.core.validators import EmailValidator
import os
from django.utils.text import slugify
from django.utils.timezone import now

def email_directory_path(instance, filename):
    # Extract the domain part of the email address and sanitize it
    email_base = slugify(instance.uploader_email.split('@')[0])
    # Create a valid directory name from the email
    directory_name = f"uploads/{email_base}"
    
    # Get the current timestamp and format it
    timestamp = now().strftime('%Y%m%d%H%M%S')
    # Split the filename to add the timestamp before the extension
    name, ext = os.path.splitext(filename)
    # Create a filename with the timestamp
    filename_with_timestamp = f"{name}_{timestamp}{ext}"
    
    # Return the whole path to the file
    return os.path.join(directory_name, filename_with_timestamp)

# Create your models here.
class UploadedFile(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to=email_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploader_name = models.CharField(max_length=100, default='Rova Founders')
    uploader_email = models.EmailField(validators=[EmailValidator()],  default='founders@rovaai.com')

    def __str__(self):
        return self.title