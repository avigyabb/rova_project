
from .consts import *
from .traces import *
from .callgpt import explain_session_by_kpis, query_gpt
from .metrics import get_churned_sessions
from keymetrics.models import ListOfKPIs, SessionsToKPIs

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
    if(not UserListOfKPIs.filter(name=name).exists()):
        new_keymetric = ListOfKPIs(name=name, description=description, importance=importance, user=user, summary="")
        new_keymetric.save()
        steps = name.split(',')
        formatted = [s.strip() for s in steps]

        session_to_keymetric = find_sessions_with_kpis(df, formatted, True, period)
        keymetric_objs_to_add = [SessionsToKPIs(session_id=session, user=user, keymetric_id=new_keymetric.id, keymetric_name=name) for session in session_to_keymetric]
        SessionsToKPIs.objects.bulk_create(keymetric_objs_to_add)

        keymetrics = get_keymetrics_overview(user)
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

def add_keymetric_for_new_session(user, session_id):
    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)
    for keymetric in UserListOfKPIs.all():
        raw_names = keymetric.name.split(',')
        steps = [s.strip() for s in raw_names]
        belongs_to_keymetric = session_id in find_sessions_with_kpis(df, steps, True, global_period, session_id=session_id)
        if(belongs_to_keymetric and not UserSessionsToKPIs.filter(session_id=session_id, keymetric_id=keymetric.id).exists()):
            SessionsToKPIs.objects.create(session_id=session_id, user=user, keymetric_id=keymetric.id, keymetric_name=keymetric.name)

# Get all keymetrics
def get_keymetrics(user):
    keymetrics = get_keymetrics_overview(user)
    return keymetrics

# function to delete a keymetric from the list
def delete_keymetric(user, index):
    keymetrics = get_keymetrics(user)
    index_to_delete = len(keymetrics) - int(index) - 1
    name = keymetrics[index_to_delete]['name']
    ListOfKPIs.objects.filter(user=user, name=name).delete()
    SessionsToKPIs.objects.filter(user=user, keymetric_name=name).delete()

    
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