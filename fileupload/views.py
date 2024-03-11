from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404, JsonResponse
from .forms import UploadFileForm
from .models import UploadedFile
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import smtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

@csrf_exempt
@require_POST
def file_upload(request):
    if request.method == 'POST':
        # Email setup
        fromaddr = "avigyabb@gmail.com"
        toaddr = "founders@rovaai.com"
        password = "frpt hqtd fiyj zqrn"  # Be cautious with email passwords

        # SMTP server configuration
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(fromaddr, password)

        # Create email
        msg = MIMEMultipart()
        msg['From'] = fromaddr
        msg['To'] = toaddr
        msg['Subject'] = "Somebody wants their logs analyzed!"
        body = {
            "firstName": request.POST.get('firstName'),
            "lastName": request.POST.get('lastName'),
            "email": request.POST.get('email'),
            "company": request.POST.get('company'),
            "role": request.POST.get('role'),
            "additionalDetails": request.POST.get('additionalDetails'),
            "filesLink": request.POST.get('filesLink'),
        }
        msg.attach(MIMEText(json.dumps(body), 'plain'))
        
        for file in request.FILES.getlist('files'):
            # Read the file content into a variable
            # file_content = file.read()
            
            # Create a MIME part for the file attachment
            part = MIMEBase('application', "octet-stream")
            part.set_payload(file.read())  # Use the read file content
            encoders.encode_base64(part)  # Encode the attachment in base64
            part.add_header('Content-Disposition', f"attachment; filename= {file.name}")

            msg.attach(part)

            # UploadedFile.objects.create(
            #     file=file,
            #     title=file.name,
            #     uploader_email=request.POST.get('email')
            # )

        # Send email
        try :
            server.send_message(msg)
        except Exception as e:
            msg = MIMEMultipart()
            msg['From'] = fromaddr
            msg['To'] = toaddr
            msg['Subject'] = "Somebody wants their logs analyzed!"
            body = {
                "firstName": request.POST.get('firstName'),
                "lastName": request.POST.get('lastName'),
                "email": request.POST.get('email'),
                "company": request.POST.get('company'),
                "role": request.POST.get('role'),
                "additionalDetails": request.POST.get('additionalDetails'),
                "filesLink": request.POST.get('filesLink'),
                "error": str(e)
            }
            msg.attach(MIMEText(json.dumps(body), 'plain'))
            server.send_message(msg)
            print(e)
        server.quit()
        
        return JsonResponse({"message": "Files uploaded successfully"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

def file_download(request, file_id):
    try:
        file = UploadedFile.objects.get(id=file_id)
        file_path = file.file.path
        if os.path.exists(file_path):
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/adminupload")
                response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
                return response
        raise Http404
    except UploadedFile.DoesNotExist:
        raise Http404
