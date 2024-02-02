import numpy as np
import pandas as pd
from collections import defaultdict
import json

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response



# Simple function to test CS communication
@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

# Return tree of edges and event data for visualiaztion in frontend
def foo1(start, end):
    return 0

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
