
from .consts import *
from .traces import *
from .callgpt import explain_session_by_kpis, query_gpt, explain_session
from .metrics import get_churned_sessions
from keymetrics.models import ListOfKPIs, SessionsToKPIs, SessionsToScores
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
import random
import json

#Function to construct the overall representation
def get_keymetrics_overview(user):
    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)
    # Fetch all KeyMetric instances
    keymetrics_query = UserListOfKPIs.all()
    keymetrics_data = []
    for keymetric in keymetrics_query:
        # Fetch the session IDs related to the current KeyMetric
        session_ids = list(UserSessionsToKPIs.filter(keymetric_id=keymetric.id).values_list('session_id', flat=True))
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
def add_keymetric(user, name, description, importance, period=None):
    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    count = None
    if(not UserListOfKPIs.filter(name=name).exists()):
        new_keymetric = ListOfKPIs(user=user, name=name, description=description, importance=importance, summary="")
        new_keymetric.save()
        steps = name.split(',')
        formatted = [s.strip() for s in steps]
        if('Custom Eval' in formatted):
            count = assign_custom_eval(user, new_keymetric)
        else:
            session_to_keymetric = find_sessions_with_kpis(DataframeLoader.get_dataframe('df'), formatted, True, period)
            keymetric_objs_to_add = [SessionsToKPIs(user=user, session_id=session, keymetric_id=new_keymetric.id, keymetric_name=name) for session in session_to_keymetric]
            SessionsToKPIs.objects.bulk_create(keymetric_objs_to_add)
        keymetrics = get_keymetrics_overview(user)
        search_name = name+'-'+str(count) if count else name
        messages = explain_session_by_kpis(DataframeLoader.get_dataframe('df'), keymetrics, search_name)
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

def assign_custom_eval(user, keymetric, n=0.3):
    count = ListOfKPIs.objects.filter(user=user,name__icontains='Custom Eval').count()
    keymetric.name = keymetric.name + "-" + str(count+1)
    keymetric.save()

    df = DataframeLoader.get_dataframe('df')
    sessions_df = DataframeLoader.get_dataframe('sessions_df')

    to_explore = list(df['session_id'].unique())
    random.shuffle(to_explore)

    total_sessions_observed = 0
    next_id = to_explore[total_sessions_observed]

    visited = []

    while(total_sessions_observed <= 0.3*len(to_explore)):
        filtered = df[df['session_id'] == next_id]
        custom_score = explain_session(filtered, flag=3, custom_eval={'description': keymetric.description, 'importance': keymetric.importance})
        if(custom_score['score'] != 'N/A'):
            visited.append(next_id)
            to_explore = list(find_similar_sessions(sessions_df, next_id, None).difference(visited))
            session_score, created = SessionsToScores.objects.get_or_create(user=user, session_id=next_id)
            if(json.loads(session_score.custom_score) is not None):
                temp = json.loads(session_score.custom_score)
                temp.update({keymetric.name : custom_score['score']})
                session_score.custom_score = json.dumps(temp)
            else:
                session_score.custom_score = json.dumps({keymetric.name : custom_score['score']})
            session_score.save()
            SessionsToKPIs.objects.get_or_create(user=user, session_id=next_id, keymetric_id=keymetric.id, keymetric_name=keymetric.name)
        to_explore = to_explore[1:]
        next_id = to_explore[0]
        total_sessions_observed += 1

    return count+1

def add_keymetric_for_new_session(user, session_id):
    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)
    for keymetric in UserListOfKPIs.all():
        raw_names = keymetric.name.split(',')
        steps = [s.strip() for s in raw_names]
        belongs_to_keymetric = session_id in find_sessions_with_kpis(DataframeLoader.get_dataframe('df'), steps, True, global_period, session_id=session_id)
        if(belongs_to_keymetric and not UserSessionsToKPIs.filter(session_id=session_id, keymetric_id=keymetric.id).exists()):
            SessionsToKPIs.objects.create( user=user, session_id=session_id, keymetric_id=keymetric.id, keymetric_name=keymetric.name)

# Get all keymetrics
def get_keymetrics(user):
    keymetrics = get_keymetrics_overview(user)
    return keymetrics

# function to delete a keymetric from the list
def delete_keymetric(user, index):
    keymetrics = get_keymetrics(user)
    index_to_delete = len(keymetrics) - int(index) - 1
    name = keymetrics[index_to_delete]['name']
    session_ids = SessionsToKPIs.objects.filter(user=user, keymetric_name=name)
    if("Custom Eval" in name):
        for session_id in session_ids:
            score = SessionsToScores.objects.get(user=user, session_id=session_id.session_id)
            temp = json.loads(score.custom_score)
            if(temp is not None):
                temp.pop(name, None)
                score.custom_score = json.dumps(temp)
                score.save()
        session_ids.delete()
    else:
        session_ids.delete()
    ListOfKPIs.objects.filter(user=user, name=name).delete()

# given a list of events that are cared about (kpis), returns all sessions with all of those events
def find_sessions_with_kpis(df, raw_event_names, in_order=False, period=None, session_id=None):

    churn_flag = False
    event_names = raw_event_names
    
    if(period is None):
        period = global_period

    if('churn' in raw_event_names):
        event_names.remove('churn')
        churn_flag = True

    # If "trace" is in event_names, we'll look for any 'llm' event type as well.
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    check_for_llm = 'trace' in event_names
    if(event_names):
        filtered_df = df[(df['event_name'].isin(event_names)) | (df['event_type'] == 'llm' if check_for_llm else False)]
    else:
        filtered_df = df
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
        churned_sessions = get_churned_sessions(df, "{} days 00:00:00".format(period))
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