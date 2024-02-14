
from .consts import *
from .traces import *
from .callgpt import *
from keymetrics.models import ListOfKPIs, SessionsToKPIs
from collections import defaultdict

# Dictionary that maps importance texts to score
importance_score_dict = {
    "Very Negative": 0,
    "Negative": 25,
    "Neutral": 50,
    "Positive": 75,
    "Very Positive": 99
}

def tree():
    return defaultdict(tree)

# Returns a list of session ID, score pairs sorted by score in ascending order
def score_sessions_based_on_kpis(user, n):
    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)
    # Find all unique session IDs
    unique_session_ids = UserSessionsToKPIs.values_list('session_id', flat=True).distinct()

    # Create a dictionary mapping all sessions ids to 0 initial score
    session_score_dict = {session_id: 0 for session_id in unique_session_ids}
    session_freq_dict = {session_id: 0 for session_id in unique_session_ids}
    session_score_name = defaultdict(set)

    # Loop over all KeyMetric instances
    session_metrics_query = UserSessionsToKPIs.all()
    for session_metric in session_metrics_query:
        session_freq_dict[session_metric.session_id] += 1
        # Grab the associated KeyMetric
        key_metric = UserListOfKPIs.get(id=session_metric.keymetric_id)
        # Add to the score
        session_score_dict[session_metric.session_id] += importance_score_dict[key_metric.importance]
        session_score_name[session_metric.session_id].add(key_metric.name)

    for session_id in session_freq_dict:
        session_score_dict[session_id] = session_score_dict[session_id] / session_freq_dict[session_id]

    # Create a list of session ID, score pairs sorted by score in ascending order
    # Only contains sessions that have a KPI included
    session_score_dict = {k: v for k, v in sorted(session_score_dict.items(), key=lambda item: item[1])}
    worst_ids = list(session_score_dict.keys())[0:n]
    return worst_ids, session_score_dict, session_score_name

# Returns a list of session ID, score pairs sorted by score in ascending order
def score_and_return_sessions(user):

    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)

    worst_ids, scores_map, _ = score_sessions_based_on_kpis(user, n=5)
    worst_sessions = UserSessionsToKPIs.filter(session_id__in=worst_ids)
    session_score_dict = defaultdict(tree)
    
    for session_metric in worst_sessions:

        # Grab the associated KeyMetric
        key_metric = UserListOfKPIs.get(id=session_metric.keymetric_id)
        # Add to the score
        if(session_metric.session_id not in session_score_dict):
            filtered = df[df['session_id'] == session_metric.session_id]
            session_score_dict[session_metric.session_id]['summary'] = explain_session(filtered)
            session_score_dict[session_metric.session_id]['user_id'] = filtered.iloc[0]['user_id']
            session_score_dict[session_metric.session_id]['timestamp'] = filtered.iloc[0]['timestamp']
            session_score_dict[session_metric.session_id]['score'] = scores_map[session_metric.session_id]
            session_score_dict[session_metric.session_id]['tags'] = []
        session_score_dict[session_metric.session_id]['tags'].append(key_metric.name)

    # Create a list of session ID, score pairs sorted by score in ascending order

    return session_score_dict

