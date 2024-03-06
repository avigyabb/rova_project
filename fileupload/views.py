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

@csrf_exempt
@require_POST
def file_upload(request):
    if request.method == 'POST':
        files = request.FILES.getlist('file')
        uploader_name = request.POST.get('uploader_name')
        uploader_email = request.POST.get('uploader_email')

        for file in files:
            UploadedFile.objects.create(
                file=file,
                title=file.name,
                uploader_name=uploader_name,
                uploader_email=uploader_email
            )
        
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
