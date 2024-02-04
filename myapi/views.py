import numpy as np
import pandas as pd
from collections import defaultdict
import json

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

import sklearn.cluster

import os
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings

embeddings_model = OpenAIEmbeddings(openai_api_key="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")
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

# Simple function to test CS communication
@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

def foo1(stard, end):
   pass

# Asks ChatGPT to identify topics
def query_gpt(msg_arr, model="gpt-4-turbo-preview", temperature=0.0, max_tokens=512):

    response = client.chat.completions.create(
        model=model,
        messages=msg_arr,
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
        n=1,
        stop=None
    )

    return json.loads(response.choices[0].message.content)

# Builds system and user prompts for chatGPT calling
def build_prompt(samples):
    system_prompt = "You are a data analyst inspecting clusters of questions asked by users. \
                     You want to create a holstic description of the cluster given it's samples. \n \
                     Summarize each of the following groups of samples into a single sentence or topic, no more than 10 words, \
                     that accurately summariezes the intent of the user in this platform. \n \
                     Return your result as a JSON object with the key being the provided Category number and \
                     the value being the summary description you create for that category \n \
                     For example, a single category should look like {1:'YOUR SUMARY OF SAMPLES IN CATEGORY ONE GOES HERE'} "

    user_prompt = ""
    for category in samples.keys():
      sample = samples[category]
      user_prompt += f"Category: {category}\n" + f"Samples: {sample}\n\n"
    messages = [{'role':'system', 'content':system_prompt}, {'role':'user', 'content':user_prompt}]
    return messages

# Grab all questions from file
def questions_from_file(path):
   # Open your file
    with open(path, 'r') as file:
        # Iterate over each line
        questions = json.load(file)
    df = pd.DataFrame(questions)
    sentences = list(df['query'])
    return sentences

# Get cluster assignments using OpenAI's embedding model
def get_assignments(sentences, n_clusters=5):
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
def generate_histogram(n_clusters):
    data = {}
    sentences = questions_from_file('content/user_questions.json')
    counts_by_label, samples_by_label = cluster_samples(get_assignments(sentences, n_clusters), sentences, n_clusters)
    response_obj = query_gpt(build_prompt(samples_by_label))
    histogram = dict()
    for key in response_obj.keys():
        histogram[response_obj[key]] = counts_by_label[int(key)]
    return histogram

# Return the df corresponding to a JSON file
def get_df_from_json(path):
    dictionaries = []

    # Open your file
    with open(path, 'r') as file:
        # Iterate over each line
        dictionaries = json.load(file)

    # Now 'dictionaries' is a list of dictionaries, each representing a line in your file
    df = pd.DataFrame(dictionaries)

    # Convert 'timestamp' to datetime if not already
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df

# Returns all users and their sessions as nested objects 
def events_to_traces(path_to_journeys):
    dictionaries = []

    # Open your file
    with open(path_to_journeys, 'r') as file:
        # Iterate over each line
        dictionaries = json.load(file)

    # Now 'dictionaries' is a list of dictionaries, each representing a line in your file
    df = pd.DataFrame(dictionaries)

    # Convert 'timestamp' to datetime if not already
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Sort by 'userId' first, then by 'timestamp'
    sorted_df = df.sort_values(by=['userId', 'timestamp'])
    sorted_df = sorted_df.fillna('')
    
    events = defaultdict(list)

    for userid, group in sorted_df.groupby('userId'):
        buffer = []
        for _, row in group.iterrows():
            row_dict = row.to_dict()
            if row_dict['type'] == 'LLM':
                buffer.append(row_dict)
            else:
                if buffer:
                    events[userid].append({'type':'Trace', 'eventName':'Trace', 'events':buffer})
                    buffer = []
                events[userid].append(row_dict)
        if buffer:
            events[userid].append({'type':'Trace', 'eventName':'Trace', 'events':buffer})

    return events

# Finds all paths between start and end per user
def find_paths(rova_data, start_event_name, end_event_name):
    paths = defaultdict(list)

    for user in rova_data.keys():

      events_per_user = rova_data[user]
      users_paths = []
      tracking = False
      current_path = []

      for event in events_per_user:

        if(event['eventName'] == start_event_name):
          tracking = True
          current_path.append(event)

        elif(tracking and event['eventName'] == end_event_name or event['eventName']=='dropoff'):
          current_path.append(event)
          users_paths.append(current_path)
          current_path = []
          tracking = False

        elif(tracking):
          current_path.append(event)
        
      if len(current_path) > 0:
        current_path.append({"userId": user, "timestamp":np.NaN, 'type': "Product", "eventName" : "dropoff", "meta":{}})
        users_paths.append(current_path)

      paths[user] = users_paths

    return paths

# Finds all traces per user with specific event occuring at given step and beginning and ending with provided event names
def filter_paths(paths, step, event_name):
  filtered_paths = defaultdict(list);
  for user in paths.keys():
    for path in paths[user]:
      if((int(step) < len(path) - 1) and (path[step]['eventName'] == 'event_name')):
        filtered_paths[user].append(path)
  return filtered_paths

'''
Returns the number of active users (defined as
users who have performed an event from the given 
events list) at each time interval 
'''
def num_active_users(path_to_journeys, events, time_interval):
  df = get_df_from_json(path_to_journeys)

  # Filter for rows where 'eventName' is in 'events'
  events = events.split(",")
  df_filtered = df[df['eventName'].isin(events)]

  # Round 'timestamp' to 'time_interval'
  df_filtered['rounded_timestamp'] = df_filtered['timestamp'].dt.round(time_interval)
  df_filtered['rounded_timestamp'] = df_filtered['rounded_timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')

  # Group by 'rounded_timestamp' and 'userId'
  df_result = df_filtered.groupby(['rounded_timestamp', 'userId']).first().reset_index()

  # Count the number of unique 'userId' at each 'rounded_timestamp'
  rounded_timestamp_counts = df_result['rounded_timestamp'].value_counts(sort=False).to_dict()
  return rounded_timestamp_counts


# Processes a given user session query
def process_session_query(query):
   return query

# client-server comm for finding filtered paths
@api_view(['GET'])
def get_fpaths(request):
    startEvent = request.GET.get('startEvent')
    endEvent = request.GET.get('endEvent')
    rova_data = events_to_traces('content/synthetic_user_journeys.json')
    paths = find_paths(rova_data, startEvent, endEvent)
    step_num = request.GET.get('step_num')
    event_name = request.GET.get('type')
    filtered = filter_paths(paths, step_num, event_name)
    return Response({'filtered_paths': filtered})

# client-server comm for finding paths
@api_view(['GET'])
def get_paths(request):
    start = request.GET.get('start')
    end = request.GET.get('end')
    tree = foo1(start, end)
    return Response({'paths': tree})

# client-server comm for finding trace sessions for all users
@api_view(['GET'])
def get_sessions(request):
    sessions = events_to_traces('content/synthetic_user_journeys.json')
    return Response({'sessions': sessions})

# client-server comm for finding trace sessions for specific user
@api_view(['GET'])
def get_user(request):
    data = events_to_traces('content/synthetic_user_journeys.json')[request.GET.get('userId')]
    return Response({'info':data})

# client-server comm for finding histogram
@api_view(['GET'])
def get_histogram(request):
    histogram = generate_histogram(5)
    return Response({'histogram': histogram})

# client-server comm for finding num active users
@api_view(['GET'])
def get_num_active_users(request):
    events = request.GET.get('events')
    time_interval = request.GET.get('time_interval')
    data = num_active_users('content/synthetic_user_journeys.json', events, time_interval)
    return Response({'info':data})

# client-server comm for finding processed query
@api_view(['GET'])
def get_processed_query(request):
    query = request.GET.get('query')
    return Response({'processed_query': process_session_query(query)})