
from .consts import *
from .traces import *
from .callgpt import explain_session_by_kpis, query_gpt
from .metrics import get_churned_sessions
from .scoring import score_sessions_based_on_kpis
from keymetrics.models import KeyMetricTable, SessionKeyMetric
from django.db.models import Count
import numpy as np
import random
from django.db.models import Count

#Function to construct the overall representation
def get_keymetrics_overview():
    # Fetch all KeyMetric instances
    keymetrics_query = KeyMetricTable.objects.all()
    keymetrics_data = []
    for keymetric in keymetrics_query:
        # Fetch the session IDs related to the current KeyMetric
        session_ids = list(SessionKeyMetric.objects.filter(keymetric_id=keymetric.id).values_list('session_id', flat=True))
        # The num_events is the count of session IDs for the current KeyMetric
        num_events = len(session_ids)
        # Construct the dictionary for the current KeyMetric
        keymetric_dict = {
            "name": keymetric.name,
            "description": keymetric.description,
            "importance": keymetric.importance,
            "session_ids": session_ids,
            "num_events": num_events,
            "analysis":keymetric.summary
        }
        keymetrics_data.append(keymetric_dict)
    return keymetrics_data


# Add a new category
def add_keymetric(name, description, importance):
    if(not KeyMetricTable.objects.filter(name=name).exists()):
        new_keymetric = KeyMetricTable(name=name, description=description, importance=importance, user_id=0, summary="")
        new_keymetric.save()
        steps = name.split(',')
        formatted = [s.strip() for s in steps]

        session_to_keymetric = find_sessions_with_kpis(df, formatted, True)
        keymetric_objs_to_add = [SessionKeyMetric(session_id=session, keymetric_id=new_keymetric.id, keymetric_name=name) for session in session_to_keymetric]
        SessionKeyMetric.objects.bulk_create(keymetric_objs_to_add)

        keymetrics = get_keymetrics_overview()
        messages = explain_session_by_kpis(df, keymetrics, name)
        summary = ""
        if(messages):
            summary = query_gpt(
                client,
                messages,
                model="gpt-3.5-turbo-0125",
                max_tokens=100,
                temperature=0,
                json_output=False,
            )
        else:
            summary = "No matching sessions found!"
        new_keymetric.summary = summary
        new_keymetric.save()

def add_keymetric_for_new_session(session_id):
    for keymetric in KeyMetricTable.objects.all():
        raw_names = keymetric.name.split(',')
        steps = [s.strip() for s in raw_names]
        belongs_to_keymetric = session_id in find_sessions_with_kpis(df, steps, True, session_id=session_id)
        if(belongs_to_keymetric and not SessionKeyMetric.objects.filter(session_id=session_id, keymetric_id=keymetric.id).exists()):
            SessionKeyMetric.objects.create(session_id=session_id, keymetric_id=keymetric.id, keymetric_name=keymetric.name)
    print(score_sessions_based_on_kpis())

# Get all keymetrics
def get_keymetrics():
    keymetrics = get_keymetrics_overview()
    return keymetrics

# function to delete a keymetric from the list
def delete_keymetric(index):
    keymetrics = get_keymetrics()
    index_to_delete = len(keymetrics) - int(index) - 1
    name = keymetrics[index_to_delete]['name']
    KeyMetricTable.objects.filter(name=name).delete()
    SessionKeyMetric.objects.filter(keymetric_name=name).delete()

    
# given a list of events that are cared about (kpis), returns all sessions with all of those events
def find_sessions_with_kpis(df, raw_event_names, in_order=False, session_id=None):
    churn_flag = False
    event_names = raw_event_names
    if('churn' in raw_event_names):
        event_names.remove('churn')
        churn_flag = True

    # If "trace" is in event_names, we'll look for any 'llm' event type as well.
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    check_for_llm = 'trace' in event_names
    # if check_for_llm:
    #     # Remove 'trace' from event_names and prepare to check for 'llm' events.
    #     event_names = [e for e in event_names if e != 'trace']
        
    # Filter the DataFrame to only include rows with relevant event names or 'llm' event types.
    filtered_df = df[(df['event_name'].isin(event_names)) | (df['event_type'] == 'llm' if check_for_llm else False)]
    
    def check_sequence(group):
        group = group.sort_values('timestamp')
        # Create a list of event names for the session, replacing 'llm' events with 'trace' if needed.
        events = ['trace' if (row['event_type'] == 'llm' and check_for_llm) else row['event_name'] for index, row in group.iterrows()]
        if in_order:
            # Check if all event_names appear in the correct order in the session.
            try:
                # Find the index of the first occurrence of each event name in the list.
                indices = [events.index(name) for name in event_names]
                # Check if indices are strictly increasing, indicating correct order.
                return all(x < y for x, y in zip(indices, indices[1:]))
            except ValueError:
                # If any event_name is not found, the session doesn't match.
                return False
        else:
            # Check if the session contains all event_names, order doesn't matter.
            return all(name in events for name in event_names)
    if(churn_flag):
        churned_sessions = get_churned_sessions(df, "0 days 00:00:00")
    # Group by session_id and apply the check_sequence function, then filter groups that return True.
    if(session_id is not None):
        valid_sessions = filtered_df[filtered_df['session_id'] == session_id].filter(check_sequence)
    else:
        valid_sessions = filtered_df.groupby('session_id').filter(check_sequence)
    valid_sessions = set(valid_sessions['session_id'].unique().tolist())
    
    # Return the unique session_ids of the valid sessions.
    if(churn_flag):
        return valid_sessions.intersection(churned_sessions)
    else:
        return valid_sessions