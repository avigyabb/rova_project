from collections import defaultdict
import pandas as pd
import numpy as np
import sklearn.cluster
import json
from .callgpt import *

# Grab all questions from file
def questions_from_file(path):
    # Open your file
    with open(path, "r") as file:
        # Iterate over each line
        questions = json.load(file)
    df = pd.DataFrame(questions)
    sentences = list(df["query"])
    return sentences


# Get cluster assignments using OpenAI's embedding model
def get_assignments(embeddings_model, sentences, n_clusters=5):
    embeddings = np.array(embeddings_model.embed_documents(sentences))
    clustering_model = sklearn.cluster.MiniBatchKMeans(n_clusters=n_clusters)
    clustering_model.fit(embeddings)
    cluster_assignment = clustering_model.labels_
    return np.array(cluster_assignment)


# Sort sentences by cluster
def cluster_samples(assignments, sentences, n_clusters):
    queries_by_label = defaultdict(list)
    samples_by_label = defaultdict(list)
    counts_by_label = dict()
    sent_arr = np.array(sentences)
    for label in range(n_clusters):
        indexes = np.where(assignments == label)[0].reshape((1, -1)).T
        all_queries = sent_arr[indexes].flatten()
        queries_by_label[label] = all_queries
        counts_by_label[label] = len(all_queries)
        samples_by_label[label] = np.random.choice(all_queries[:-1], 5, replace=False)
    return counts_by_label, samples_by_label


# Aggregate code to get top 10 questions
def generate_histogram(embeddings_model, gptclient, n_clusters):
    data = {}
    sentences = questions_from_file("content/user_questions.json")
    counts_by_label, samples_by_label = cluster_samples(
        get_assignments(embeddings_model, sentences, n_clusters), sentences, n_clusters
    )
    response_obj = query_gpt(gptclient, build_topics_prompt(samples_by_label), json_output=True)
    histogram = dict()
    for key in response_obj.keys():
        histogram[response_obj[key]] = counts_by_label[int(key)]
    return histogram