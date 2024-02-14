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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# Embed the category description and add all session ids
def assign_session_ids_to_category(user, category_name, category_description, category, similarity_threshold=0.74):
    # Embed the category description
    category_embedding = np.array(embeddings_model.embed_documents([category_description]))[0]
    category_embedding = category_embedding.reshape(1, -1)

    # Find similarity between the category description and the llm events
    llm_df[category_name] = cosine_similarity(category_embedding, list(llm_df["embeds"])).flatten()
    llm_df[category_name] = llm_df[category_name] > similarity_threshold

    # Find all session ids that have a similarity above the threshold
    unique_session_ids = llm_df[llm_df[category_name]]["session_id"].unique()
    for session_id in unique_session_ids:
        session = SessionCategory(user=user, category=category, session_id=session_id)
        session.save()
    return unique_session_ids

def autosuggest_categories(user):
    UserCategory = Category.objects.filter(user=user)
    if(UserCategory.count() <= 0):
        sessions_df = embed_all_sessions(df, embeddings_model)
        embeddings = np.array(sessions_df["embeds"].tolist()) 
        # Clustering with K-Means
        kmeans = KMeans(n_clusters=10, random_state=0).fit(embeddings)
        # Assign cluster labels to DataFrame
        sessions_df['cluster_label'] = kmeans.labels_
        # Calculate the distance between each point and the centroid of its cluster
        centroids = kmeans.cluster_centers_
        distances = cdist(embeddings, centroids, 'euclidean')
        # The distance for each point to its cluster centroid
        sessions_df['distance_to_centroid'] = np.min(distances, axis=1)
        # Find the closest row to each cluster's centroid
        closest_rows = sessions_df.loc[sessions_df.groupby('cluster_label')['distance_to_centroid'].idxmin()]
        count = 0
        for row in closest_rows.iterrows():
            if(count < 2):
                prompt = prompt_to_generate_clusters(row[1]['session_to_text'], 0)
                answer = query_gpt(client, prompt, json_output=True)
                modded_name = answer['name'] + ' 🤖'
                new_category = Category(user=user, name=modded_name, description=answer['description'])
                new_category.save()
                assign_session_ids_to_category(user, modded_name, answer['description'], new_category)
                count += 1
            else:
                break
            
@api_view(["GET"])
def category_list(request):
    UserCategory = Category.objects.filter(user=request.user)
    categories = UserCategory.all().order_by("date")
    data = serializers.serialize("json", categories)
    data = json.loads(data)
    for index, category in enumerate(data):
        category["fields"]["volume"] = volume_for_category(request.user, category['pk'])
        category["fields"]["trend"] = "-"  # not done
        category["fields"]["path"] = "-"  # not done
    autosuggest_categories(request.user)
    return Response(data, content_type="application/json")


def volume_for_category(user, category):
    UserSessionCategory = SessionCategory.objects.filter(user=user)
    return UserSessionCategory.filter(category=category).count()


@csrf_exempt
@require_POST
def post_user_category(request):
    data = json.loads(request.body)
    name = data.get("name")
    description = data.get("description")
    new_category = Category(user=request.user, name=name, description=description)
    new_category.save()
    assign_session_ids_to_category(request.user, name, description, new_category)
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
    autosuggest_categories(user)

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
        session_category_ids = [session_category.category_id for session_category in UserSessionCategory.filter(session_id = session_id)]
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
    _, session_score_dict, session_score_names = score_sessions_based_on_kpis(user, 1)
    category_count = defaultdict(int)
    category_score = defaultdict(int)
    category_volume = defaultdict(int)
    category_score_names = defaultdict(set) # eventually we could order this by scores that have greatest freq

    for row in UserSessionCategory.all():
        if row.session_id in session_score_dict:
            category_name = UserCategory.get(pk=row.category_id).name
            category_count[category_name] += 1
            category_score[category_name] += session_score_dict[row.session_id]
            category_score_names[category_name] = category_score_names[category_name].union(session_score_names[row.session_id])
            if row.session_id not in category_volume:
                category_volume[category_name] = volume_for_category(user, row.category_id)
    
    for category_name in category_count:
        category_score[category_name] = round(category_score[category_name] / category_count[category_name])

    category_score = {k: v for k, v in sorted(category_score.items(), key=lambda item: item[1], reverse=True)}
    return Response({
        "category_score": category_score, 
        "category_volume": category_volume,
        "category_score_names": category_score_names
    })
        
