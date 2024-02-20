from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from myapi.consts import *
from myapi.sessions import *
from myapi.views import *
from rest_framework.decorators import api_view
from .models import Dataset, SessionDataset

# Create your views here.
@csrf_exempt
@require_POST
def add_new_dataset (request):
    data = json.loads(request.body)
    dataset = Dataset(user = request.user, name = data.get("name"), description = data.get("description"))
    dataset.save()
    return JsonResponse({"success": "Dataset created successfully."})

@api_view(["GET"])
def get_properties_for_datasets(request):
    datasets = Dataset.objects.filter(user=request.user)
    response_data = []
 
    for dataset in datasets:
        num_sessions = SessionDataset.objects.filter(user=request.user, dataset=dataset).count()
        
        session_ids = [session_data.session_id for session_data in SessionDataset.objects.filter(user=request.user, dataset=dataset)]
        session_scores = ScoresLoader.get_scores("session_scores")
        average_score = 50
        if session_scores and len(session_scores) > 0:
            average_scores = 0
            for session_id in session_scores:
                if session_id in session_ids:
                    average_score += session_scores[session_id]["score"]

        category_names = defaultdict(int)
        for session_id in session_ids:
            session_category_names = list(get_category_names_given_session_id(session_id))
            for session_category_name in session_category_names:
                category_names[session_category_name] += 1
        sorted_category_names = sorted(category_names.items(), key=lambda category_name: category_name[1], reverse=True)
        top_three_category_names = sorted_category_names[:3]
        top_three_category_names = [top_three_category_name[0] for top_three_category_name in top_three_category_names]

        response_data.append({"id": dataset.id, "name": dataset.name, "description": dataset.description, "count": num_sessions, "score": average_score, "tags": top_three_category_names})
    return Response({"datasets": response_data})


@csrf_exempt
@require_POST
def add_sessions_to_datasets (request):
    session_ids = json.loads(request.GET.get("session_ids"))
    dataset_names = json.loads(request.GET.get("dataset_names"))
    UserDataset = Dataset.objects.filter(user = request.user)
    for dataset_name in dataset_names:
        dataset = UserDataset.get(name = dataset_name)
        existing_session_ids = list(UserDataset.filter(dataset = dataset).values_list("session_id", flat = True))
        for session_id in session_ids:
            # don't add session_id if it is already part of the dataset
            if session_id not in existing_session_ids:
                sessionDataset = SessionDataset (user = request.user, session_id = session_id, dataset = dataset)
                sessionDataset.save()

@api_view(["GET"])
def get_session_data_given_dataset (request):
    dataset_name = json.loads(request.GET.get("dataset_name"))
    dataset = Dataset.objects.filter(user = request.user).get(name = dataset_name)
    session_ids = [session_data.session_id for session_data in SessionDataset.objects.filter(user = request.user).filter(dataset = dataset)]
    return Response({"events" : get_session_events_given_session_ids(session_ids)})

