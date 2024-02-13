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


# Embed the category description and add all session ids
def assign_session_ids_to_category(category_name, category_description, category_id, similarity_threshold=0.74):
    # Embed the category description
    category_embedding = np.array(embeddings_model.embed_documents([category_description]))[0]
    category_embedding = category_embedding.reshape(1, -1)

    # Find similarity between the category description and the llm events
    llm_df[category_name] = cosine_similarity(category_embedding, list(llm_df["embeds"])).flatten()
    llm_df[category_name] = llm_df[category_name] > similarity_threshold

    # Find all session ids that have a similarity above the threshold
    unique_session_ids = llm_df[llm_df[category_name]]["session_id"].unique()
    for session_id in unique_session_ids:
        session = SessionCategory(category_id=category_id, session_id=session_id)
        session.save()
    return unique_session_ids

def autosuggest_categories():
    if(Category.objects.count() <= 0):
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
        for row in closest_rows.iterrows()[0:1]:
            prompt = prompt_to_generate_clusters(row, 0)
            answer = query_gpt(client, prompt, json_output=True)
            modded_name = answer['name'] +' (suggested)'
            new_category = Category(name=modded_name, description=answer['description'], user_id=0)
            new_category.save()
            assign_session_ids_to_category(modded_name, answer['description'], new_category.pk)

@api_view(["GET"])
def category_list(request):
    categories = Category.objects.all().order_by("date")
    data = serializers.serialize("json", categories)
    data = json.loads(data)
    for index, category in enumerate(data):
        category["fields"]["volume"] = volume_for_category(category["pk"])
        category["fields"]["trend"] = "-"  # not done
        category["fields"]["path"] = "-"  # not done
    autosuggest_categories()
    return Response(data, content_type="application/json")


def volume_for_category(category_id):
    return SessionCategory.objects.filter(category_id=category_id).count()


@api_view(["POST"])
def post_user_category(request):
    name = request.data.get("name")
    description = request.data.get("description")
    new_category = Category(name=name, description=description, user_id=0)
    new_category.save()
    assign_session_ids_to_category(name, description, new_category.pk)
    return Response({"success": "Category created successfully."})


@api_view(["GET"])
def delete_user_category(request):
    index = request.GET.get("index")
    category_to_delete = Category.objects.get(pk=index)
    # remove the category from the llm_df
    # llm_df = llm_df.drop(columns=[category_to_delete.name])
    delete_category_sessions(index)
    category_to_delete.delete()
    return Response({"message": "Category deleted successfully"})


def delete_category_sessions(category_id):
    SessionCategory.objects.filter(category_id=category_id).delete()
    autosuggest_categories()


def filter_session_ids_given_categories(session_ids, included_categories, excluded_categories):
    included_category_ids = []
    for category in included_categories:
        included_category_ids.append(Category.objects.get(name = category).pk)
    excluded_category_ids = []
    for category in excluded_categories:
        excluded_category_ids.append(Category.objects.get(name = category).pk)
    filtered_session_ids = []
    for session_id in session_ids:
        session_category_ids = [session_category.category_id for session_category in SessionCategory.objects.filter(session_id = session_id)]
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
