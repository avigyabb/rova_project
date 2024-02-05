import numpy as np
import pandas as pd
from collections import defaultdict
import json
import math

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

import sklearn.cluster

import os
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings

import clickhouse_connect

embeddings_model = OpenAIEmbeddings(
    openai_api_key="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"
)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

# setup clickhouse client
clickhouse_client = clickhouse_connect.get_client(
    host="tbbhwu2ql2.us-east-2.aws.clickhouse.cloud",
    port=8443,
    username="default",
    password="V8fBb2R_ZmW4i",
)

def load_df_once():
    sql = """
    -- Query for buster_dev.product events
    SELECT
        'product' AS table_source,
        event_name,
        user_id,
        data_source_id,
        timestamp,
        session_id,
        trace_id,
        NULL AS input_content, -- Placeholder columns for llm table
        NULL AS output_content,
        NULL AS llm_in_use,
        NULL AS input_token_count,
        NULL AS output_token_count,
        NULL AS cost,
        NULL AS time_to_first_token,
        NULL AS latency,
        NULL AS error_status,
        NULL AS chat_id
    FROM
        buster_dev.product

    UNION ALL

    -- Query for buster_dev.llm events
    SELECT
        'llm' AS table_source,
        event_name,
        user_id,
        data_source_id,
        timestamp,
        session_id,
        trace_id,
        input_content,
        output_content,
        llm_in_use,
        input_token_count,
        output_token_count,
        cost,
        time_to_first_token,
        latency,
        error_status,
        chat_id
    FROM
        buster_dev.llm

    ORDER BY
        timestamp
    """
    result = clickhouse_client.query(sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names).sort_values(by=['timestamp'])
    return df
df = load_df_once()

# Simple function to test CS communication
@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello, world!"})


def foo1(stard, end):
    pass


# Asks ChatGPT to identify topics
def query_gpt(
    msg_arr,
    model="gpt-4-turbo-preview",
    temperature=0.0,
    max_tokens=512,
    json_output=False,
):
    response_format = {"type": "json_object"} if json_output else {"type": "text"}

    response = client.chat.completions.create(
        model=model,
        messages=msg_arr,
        temperature=temperature,
        max_tokens=max_tokens,
        response_format=response_format,
        n=1,
        stop=None,
    )

    if json_output:
        return json.loads(response.choices[0].message.content)
    else:
        return response.choices[0].message.content


# Builds prompt to categorize questions
def build_topics_prompt(samples):
    system_prompt = "You are a data analyst inspecting clusters of questions asked by users. \
                     You want to create a holstic description of the cluster given it's samples. \n \
                     Summarize each of the following groups of samples into a single sentence or topic, no more than 10 words, \
                     that accurately summarizes the intent of the user in this platform. \n \
                     Return your result as a JSON object with the key being the provided Category number and \
                     the value being the summary description you create for that category \n \
                     For example, a single category should look like {1:'YOUR SUMARY OF SAMPLES IN CATEGORY ONE GOES HERE'} "

    user_prompt = ""
    for category in samples.keys():
        sample = samples[category]
        user_prompt += f"Category: {category}\n" + f"Samples: {sample}\n\n"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    return messages


# Builds prompt to generate sql query for sessions
def build_sessions_sql_prompt(user_query):
    system_prompt = 'You are a ClickHouse expert. Given an input question, create a syntactically \
                     correct SQL query which returns the rows specified by the question. \n \
                     Unless the user specifies in the question a specific number of examples to obtain, \
                     query for at most 50 results using the LIMIT clause as per SQLite. \n \
                     Wrap each column name in double quotes (") to denote them as delimited identifiers. \n \
                     Pay attention to use only the column names you can see in the tables below. Be careful \
                     not to query for columns that do not exist. Also, pay attention to which column is in which table. \n \
                     Rows with the same session_id belong to the same session.  \n \
                     Create subqueries whenever possible, especially for UNIONs. For example: \n \
                     SELECT DISTINCT "session_id" FROM "llm" \n \
                     UNION \n \
                     SELECT DISTINCT "session_id" FROM "product" \n \
                     LIMIT 50; \n \
                     Should be: \n \
                     SELECT * \n \
                     FROM ( \n \
                     SELECT session_id FROM buster_dev.llm \n \
                     UNION DISTINCT \n \
                     SELECT session_id FROM buster_dev.product \n \
                     ) \n \
                     LIMIT 50 \n \
                     Only output SQL code without backticks, and do not include the semicolon. \n\n'

    tables = 'Only use the following tables: \n\n \
              CREATE TABLE "llm" ( \n \
              "timestamp" DATETIME, \n \
              "event_name" STRING, \n \
              "user_id" UInt32, \n \
              "session_id" UInt32, \n \
              "data_source_id" UInt32, \n \
              "input_content" String, \n \
              "output_content" String, \n \
              "llm_in_use" Bool, \n \
              "input_token_count" UInt32, \n \
              "output_token_count" UInt32, \n \
              "cost" Float32, \n \
              "time_to_first_token" Float32, \n \
              "latency" Float32, \n \
              "error_status" String, \n \
              "chat_id" UInt32, \n\n \
              /* \n \
              */\n\n \
              CREATE TABLE "product" ( \n \
              "timestamp" DATETIME, \n \
              "event_name" STRING, \n \
              "user_id" UInt32, \n \
              "session_id" UInt32, \n \
              "data_source_id" UInt32, \n\n \
              /* \n \
              3 rows from table "product" \n \
              timestamp event_name user_id session_id data_source_id \n \
              2022-06-16 16:00:00 "chat_send" 1 3 1 \n \
              2022-06-15 16:00:01 "share_dashboard" 2 4 1 \n \
              2022-02-16 16:00:02 "download_dashboard" 6 7 2 \n \
              */\n\n'

    user_prompt = "Question: " + user_query + "\nSQLQuery: "

    messages = [
        {"role": "system", "content": system_prompt + tables},
        {"role": "user", "content": user_prompt},
    ]
    return messages


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
    sentences = questions_from_file("content/user_questions.json")
    counts_by_label, samples_by_label = cluster_samples(
        get_assignments(sentences, n_clusters), sentences, n_clusters
    )
    response_obj = query_gpt(build_topics_prompt(samples_by_label), json_output=True)
    histogram = dict()
    for key in response_obj.keys():
        histogram[response_obj[key]] = counts_by_label[int(key)]
    return histogram


# Return the df corresponding to a JSON file
def get_df_from_json(path):
    dictionaries = []

    # Open your file
    with open(path, "r") as file:
        # Iterate over each line
        dictionaries = json.load(file)

    # Now 'dictionaries' is a list of dictionaries, each representing a line in your file
    df = pd.DataFrame(dictionaries)

    # Convert 'timestamp' to datetime if not already
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df


# Returns all users and their sessions as nested objects
def events_to_traces():
    events = defaultdict(list)

    for (user_id, session_id), group in df.groupby(['user_id', 'session_id']):
        buffer = []
        for _, row in group.iterrows():
            row_dict = row.to_dict()
            if row_dict['table_source'] == 'llm':
                buffer.append(row_dict)
            else:
                if buffer:
                    events[user_id].append({'table_source': 'llm', 'user_id': user_id, 'session_id':session_id, 'event_name':'trace', 'events':buffer})
                    buffer = []
                events[user_id].append(row_dict)
        if buffer:
            events[user_id].append({'table_source': 'llm', 'user_id': user_id, 'session_id':session_id, 'event_name':'trace', 'events':buffer})

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
        if(not tracking and event['event_name'] == start_event_name):
          tracking = True
          tracking_id = event['session_id']
          current_path.append(event)
        
        elif(tracking and tracking_id != event['session_id']):
          tracking_id = -1
          current_path.append({"user_id": user, "timestamp": np.NaN, 'table_source': "product", "event_name" : "dropoff"})
          users_paths.append(current_path)
          current_path = []
          tracking = False

        elif(tracking and event['event_name'] == end_event_name):
          current_path.append(event)
          users_paths.append(current_path)
          current_path = []
          tracking = False

        elif(tracking and event['session_id'] == tracking_id):
          current_path.append(event)

      if len(current_path) > 0:
        current_path.append({"user_id": user, "timestamp": np.NaN, 'table_source': "product", "event_name" : "dropoff"})
        users_paths.append(current_path)

      paths[user] = users_paths

    return paths


# Finds all traces per user with specific event occuring at given step and beginning and ending with provided event names
def filter_paths(paths, step, event_name):
    filtered_paths = defaultdict(list)
    for user in paths.keys():
        for path in paths[user]:
            if (int(step) < len(path) - 1) and (
                path[step]["eventName"] == "event_name"
            ):
                filtered_paths[user].append(path)
    return filtered_paths


"""
Returns the number of active users (defined as
users who have performed an event from the given 
events list) at each time interval 
"""


def num_active_users(path_to_journeys, events, time_interval):
    df = get_df_from_json(path_to_journeys)

    # Filter for rows where 'eventName' is in 'events'
    events = events.split(",")
    df_filtered = df[df["eventName"].isin(events)]

    # Round 'timestamp' to 'time_interval'
    df_filtered["rounded_timestamp"] = df_filtered["timestamp"].dt.round(time_interval)
    df_filtered["rounded_timestamp"] = df_filtered["rounded_timestamp"].dt.strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # Group by 'rounded_timestamp' and 'userId'
    df_result = (
        df_filtered.groupby(["rounded_timestamp", "userId"]).first().reset_index()
    )

    # Count the number of unique 'userId' at each 'rounded_timestamp'
    rounded_timestamp_counts = (
        df_result["rounded_timestamp"].value_counts(sort=False).to_dict()
    )
    return rounded_timestamp_counts


# Processes a given user session query
def process_session_query(query):
    response = query_gpt(build_sessions_sql_prompt(query))
    return response

# Returns the session data for the given session ids
def get_session_data_from_id(session_id):
    data = {"timestamp": 5, "user_id": 5}
    return data



def prune_paths (paths):
  return

def get_all_paths(paths):
  all_paths = []
  for user in paths.keys():
    all_paths += paths[user]
  return all_paths

# num_steps includes start event and end event
def compute_percentages(paths, num_steps, end_event_name):
  paths = sorted(paths, key = len)

  start_path_index = 0

  # arrow_counts[i][key] is dictionary with src_event_name, dest_event_name, and percentage for arrow key with source at step i
  arrow_counts = dict()
  # arrow_percentages is a list of form [srcEventName + srcStep, destEventName + destStep, percentage]
  arrow_percentages = []

  # box_counts[i][key] is count of eventName key at step i
  box_counts = dict()
  # box percentages[i] is a list of [key, percentage] pairs: percentages for each eventName at ith step
  box_percentages = []

  num_steps = int(num_steps)

  for i in range (num_steps):
    box_counts[i] = defaultdict(int)

  for cur_step in range(num_steps):
    count = 0
    arrow_counts[cur_step] = dict()

    for path_index in range(start_path_index, len(paths)):
      path = paths[path_index]

      # check if all path's events have already been fully explored, if so, that path should not be considered in the future
      if cur_step > (len(path) - 1):
        start_path_index += 1
      else:
        src_event_name = path[cur_step]["event_name"]
        count += 1
        
        # boxes calculations
        # last step, skip to last event of this path
        if cur_step == (num_steps - 1):
          box_counts[cur_step][path[len(path) - 1]["event_name"]] += 1
        # if not at first step and end event has been reached, skip to last step
        elif cur_step != 0 and src_event_name == end_event_name:
          box_counts[num_steps - 1][src_event_name] += 1
        else:
          box_counts[cur_step][src_event_name] += 1

        # arrows calculations
        # make sure there are at least two events left in the path to draw an arrow between
        if cur_step <= (len(path) - 2):
          # check if cur_step is the last step which is visible before end step
          if cur_step == (num_steps - 2):
            # make dest event be the last event in the path
            dest_event_name = path[len(path) - 1]["event_name"]
            key = "src:" + src_event_name + "->dest:" + dest_event_name
            if key in arrow_counts[cur_step].keys():
              arrow_counts[cur_step][key]["percentage"] += 1
            else:
              # make dest step be the last step
              arrow_counts[cur_step][key] = {"src" : src_event_name + str(cur_step),
                                            "dest" : dest_event_name + str(num_steps - 1),
                                            "percentage" : 1}
          elif cur_step < (num_steps - 2):
            dest_event_name = path[cur_step + 1]["event_name"]
            key = "src:" + src_event_name + "->dest:" + dest_event_name

            if key in arrow_counts[cur_step].keys():
              arrow_counts[cur_step][key]["percentage"] += 1
            # check if dest event is not end event
            elif dest_event_name != end_event_name:
              arrow_counts[cur_step][key] = {"src" : src_event_name + str(cur_step),
                                            "dest" : dest_event_name + str(cur_step + 1),
                                            "percentage" : 1}
            # dest event is end event, so make dest step be the last step
            else:
              arrow_counts[cur_step][key] = {"src" : src_event_name + str(cur_step),
                                      "dest" : dest_event_name + str(num_steps - 1),
                                      "percentage" : 1}

    for key in arrow_counts[cur_step].keys():
      percentage = math.ceil(100 * arrow_counts[cur_step][key]["percentage"] / count)
      if percentage > 0:
        arrow_percentages.append([arrow_counts[cur_step][key]["src"], arrow_counts[cur_step][key]["dest"], str(percentage) + "%"])

    num_boxes = len(box_counts[cur_step].keys())
    total_space = 78 - 3 - 6 * (num_boxes - 1)
    box_percentages.append([])
    box_counts_sum = sum(box_counts[cur_step].values())
    for key in box_counts[cur_step].keys():
      percentage = math.ceil(total_space * box_counts[cur_step][key] / box_counts_sum)
      if percentage > 0:
        box_percentages[cur_step].append([key, percentage])
    
    # sort largest percentage to smallest
    box_percentages[cur_step] = sorted(box_percentages[cur_step], key=lambda box : box[1], reverse = True)

  return arrow_percentages, box_percentages
      

# Finds all traces per user with specific event occuring at given step and beginning and ending with provided event names
def get_sessions_given_step(paths, step, event_name):
  session_ids = []
  for user in paths.keys():
    for path in paths[user]:
      if(step < len(path) and path[step]['event_name'] == event_name):
        session_ids.append(path[step]['session_id'])
  return session_ids

# client-server comm for finding filtered paths
@api_view(["GET"])
def get_fpaths(request):
    startEvent = request.GET.get("startEvent")
    endEvent = request.GET.get("endEvent")
    rova_data = events_to_traces("content/synthetic_user_journeys.json")
    paths = find_paths(rova_data, startEvent, endEvent)
    step_num = request.GET.get("step_num")
    event_name = request.GET.get("type")
    filtered = filter_paths(paths, step_num, event_name)
    return Response({"filtered_paths": filtered})

# client-server comm for finding filtered paths
@api_view(['GET'])
def get_sessions_at_step(request):
    startEvent = request.GET.get('startEvent')
    endEvent = request.GET.get('endEvent')
    rova_data = events_to_traces()
    paths = find_paths(rova_data, startEvent, endEvent)
    step_num = request.GET.get('step_num')
    event_name = request.GET.get('type')
    session_ids = get_sessions_given_step(paths, int(step_num), event_name)
    return Response({'session_ids': session_ids})

# client-server comm for finding paths
@api_view(["GET"])
def get_paths(request):
    start = request.GET.get("start")
    end = request.GET.get("end")
    tree = foo1(start, end)
    return Response({"paths": tree})


# client-server comm for finding trace sessions for all users
@api_view(["GET"])
def get_sessions(request):
    sessions = []
    sql_query = request.GET.get("sql")
    if sql_query:
        sessions = clickhouse_client.query(sql_query).result_rows
    print("hello")
    sessions = [session[0] for session in sessions]
    print(sessions)
    return Response({"sessions": sessions})


# client-server comm for finding trace sessions for specific user
@api_view(["GET"])
def get_user(request):
    data = events_to_traces("content/synthetic_user_journeys.json")[
        request.GET.get("userId")
    ]
    return Response({"info": data})


# client-server comm for finding histogram
@api_view(["GET"])
def get_histogram(request):
    histogram = generate_histogram(5)
    return Response({"histogram": histogram})


# client-server comm for finding num active users
@api_view(["GET"])
def get_num_active_users(request):
    events = request.GET.get("events")
    time_interval = request.GET.get("time_interval")
    data = num_active_users(
        "content/synthetic_user_journeys.json", events, time_interval
    )
    return Response({"info": data})


# client-server comm for finding processed query
@api_view(["GET"])
def get_processed_query(request):
    query = request.GET.get("query")
    return Response({"processed_query": process_session_query(query)})

@api_view(["GET"])
def get_percentages(request):
  events = events_to_traces() 

  start_event_name = request.GET.get("start_event_name")
  end_event_name = request.GET.get("end_event_name")

  paths = find_paths(events, start_event_name, end_event_name)
  arrow_percentages, box_percentages = compute_percentages(get_all_paths(paths), request.GET.get("num_steps"), end_event_name)
  return Response({"arrow_percentages" : arrow_percentages, "box_percentages" : box_percentages})

@api_view(["GET"])
def get_options(request):
  return Response({"options": ["chat_send", "pin_dashboard", "trace"]})

# client-server comm for finding session data
@api_view(["GET"])
def get_session_data(request):
    session_id = request.GET.get("session_id")
    return Response({"session_data": get_session_data_from_id(session_id)})
