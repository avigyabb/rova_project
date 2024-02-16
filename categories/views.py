from django.core import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Category, SessionCategory
from myapi.consts import *
import json 
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from myapi.callgpt import *
from myapi.consts import *
from myapi.traces import *
from myapi.scoring import *
from myapi.sessions import *
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Generates the name and description from the HDB cluster
def generate_topic_name(cluster_id):
  topic_df = llm_df[llm_df["cluster_label"] == cluster_id]
  questions = topic_df['event_text'].sample(n=5).tolist()
  msg = prompt_to_generate_topics(questions)
  return query_gpt(client, msg, json_output=True)

# Adds all session ids in a cluster to the SessionCategory DB
def assign_session_ids_to_category(user, cluster_id, category):
    topic_df = llm_df[llm_df["cluster_label"] == cluster_id]
    session_ids = list(topic_df['session_id'].unique())
    for session_id in session_ids:
        new_session_category = SessionCategory(user=user, category=category, session_id=session_id)
        new_session_category.save()

# Adds new clusters to the database
def create_new_category(user, cluster_id):
    # Add category to Category DB
    topic = generate_topic_name(cluster_id)
    new_category = Category(user=user, name='🤖 ' + topic['name'], description=topic['description'])
    new_category.save()

    # Add session IDs in the category to SessionCategory DB
    assign_session_ids_to_category(user, cluster_id, new_category)

# Generates initial list of clusters from questions
def initial_categories_cluster(user):
    # Fit clustering model to the initial data
    X = np.array(llm_df['embeds'].tolist()) 
    llm_clusterer.fit(X)
    llm_df['cluster_label'] = llm_clusterer.labels_

    # Create new categories
    for cluster_id in llm_df['cluster_label'].unique():
        create_new_category(user, cluster_id)

# Embed the category description and add all session ids
def assign_session_ids_to_user_defined_category(user, category_name, category_description, category, similarity_threshold=0.74):
    # Embed the category description
    category_embedding = np.array(embeddings_model.embed_documents([category_description]))[0]
    category_embedding = category_embedding.reshape(1, -1)
    category_embedding = umap_llm_model.transform(category_embedding)

    # Find similarity between the category description and the llm events
    llm_df[category_name] = cosine_similarity(category_embedding, list(llm_df["embeds"])).flatten()
    llm_df[category_name] = llm_df[category_name] > similarity_threshold

    # Find all session ids that have a similarity above the threshold
    unique_session_ids = llm_df[llm_df[category_name]]["session_id"].unique()
    for session_id in unique_session_ids:
        session = SessionCategory(user=user, category=category, session_id=session_id)
        session.save()
    return unique_session_ids


@api_view(["GET"])
def category_list(request):
    # if Category DB is empty, create initial categories
    if not Category.objects.filter(user=request.user).exists():
        initial_categories_cluster(request.user)

    UserCategory = Category.objects.filter(user=request.user)
    categories = UserCategory.all().order_by("date")
    data = serializers.serialize("json", categories)
    data = json.loads(data)
    for index, category in enumerate(data):
        category["fields"]["volume"] = volume_for_category(request.user, category['pk'])
        category["fields"]["trend"] = "-"  # not done
        category["fields"]["path"] = "-"  # not done
    return Response(data, content_type="application/json")


def volume_for_category(user, category_id):
    UserSessionCategory = SessionCategory.objects.filter(user=user)
    return UserSessionCategory.filter(category_id=category_id).count()


@csrf_exempt
@require_POST
def post_user_category(request):
    data = json.loads(request.body)
    name = data.get("name")
    description = data.get("description")
    new_category = Category(user=request.user, name=name, description=description)
    new_category.save()
    assign_session_ids_to_user_defined_category(request.user, name, description, new_category)
    return JsonResponse({"success": "Category created successfully."})


@api_view(["GET"])
def delete_user_category(request):
    index = request.GET.get("index")
    UserCategory = Category.objects.filter(user=request.user)
    category_to_delete = UserCategory.get(pk=index)
    # remove the category from the llm_df
    # llm_df = llm_df.drop(columns=[category_to_delete.name])
    delete_category_sessions(request.user, index)
    category_to_delete.delete()
    return Response({"message": "Category deleted successfully"})


def delete_category_sessions(user, category):
    SessionCategory.objects.filter(user=user, category=category).delete()

# Embeds the new event and assigns to relevant categories
def update_categories_with_new_event(row):
    # TODO
    pass


def filter_session_ids_given_categories(user, session_ids, included_categories, excluded_categories):
    UserCategory = Category.objects.filter(user=user)
    UserSessionCategory = SessionCategory.objects.filter(user=user)
    included_category_ids = []
    for category in included_categories:
        included_category_ids.append(UserCategory.get(name = category))
    excluded_category_ids = []
    for category in excluded_categories:
        excluded_category_ids.append(UserCategory.get(name = category))
    filtered_session_ids = []
    for session_id in session_ids:
        session_category_ids = [session_category.category for session_category in UserSessionCategory.filter(session_id = session_id)]
        include = False if len (included_category_ids) > 0 else True
        for session_category_id in session_category_ids:
            if session_category_id in excluded_category_ids:
                include = False
                break
            elif session_category_id in included_category_ids:
                include = True
        if include:
            filtered_session_ids.append(session_id)
    return filtered_session_ids

@api_view(["GET"])
def get_categories_ranking(request):
    user = request.user
    UserSessionCategory = SessionCategory.objects.filter(user=user)
    UserCategory = Category.objects.filter(user=user)
    categories_dict = {}
    all_user_categories = UserCategory.all()
    _, session_score_dict, session_score_names = score_sessions_based_on_kpis(user, 1)
    category_count = defaultdict(int)
    category_score = defaultdict(int)
    category_volume = defaultdict(int)
    category_score_names = defaultdict(set) # eventually we could order this by scores that have greatest freq

    for row in UserSessionCategory.all():
        category_name = UserCategory.get(pk=row.category_id).name
        if row.session_id in session_score_dict:
            category_count[category_name] += 1
            category_score[category_name] += session_score_dict[row.session_id]
            category_score_names[category_name] = category_score_names[category_name].union(session_score_names[row.session_id])
            if row.session_id not in category_volume: # just making sure we don't call this multiple times for no reason
                category_volume[category_name] = volume_for_category(user, row.category_id)

    # get averages for scores for each category
    for category_name in category_count:
        category_score[category_name] = round(category_score[category_name] / category_count[category_name])

    # put down score for categories that have no sessions with KPIs
    for category in all_user_categories:
        categories_dict[category.name] = category.id
        if category.name not in category_score:
            category_score[category.name] = -1
            category_score_names[category.name] = set()
            if category.id not in category_volume: # just making sure we don't call this multiple times for no reason
                category_volume[category.name] = volume_for_category(user, category.id)

    category_score = {k: v for k, v in sorted(category_score.items(), key=lambda item: item[1], reverse=True)}
    return Response({
        "category_score": category_score, 
        "category_volume": category_volume,
        "category_score_names": category_score_names,
        "all_user_categories": categories_dict
    })

@api_view(["GET"])
def get_category_sessions(request):
    print("loc7")
    category_id = int(request.GET.get("category_id"))
    UserSessionCategory = SessionCategory.objects.filter(user=request.user) # make category id unique accross users do not need this line
    session_ids_for_category = UserSessionCategory.filter(category=category_id)
    print(list(session_ids_for_category.values_list('session_id', flat=True)))
    
    session_data = get_session_data_from_ids(clickhouse_client, list(session_ids_for_category.values_list('session_id', flat=True)))

    return Response({"sessions": session_data})
        
