
from .consts import *
from .traces import *
from .callgpt import *
from keymetrics.models import KeyMetricTable, SessionKeyMetric
from collections import defaultdict

# Dictionary that maps importance texts to score
importance_score_dict = {
    "Very Negative": -1,
    "Negative": -0.4,
    "Neutral": 0,
    "Positive": 0.4,
    "Very Positive" : 1
}

def tree():
    return defaultdict(tree)

importance_score_dict = {
    "Very Negative": -1,
    "Negative": -0.4,
    "Neutral": 0,
    "Positive": 0.4,
    "Very Positive" : 1
}

# Returns a list of session ID, score pairs sorted by score in ascending order
def score_sessions_based_on_kpis(n):

    # Find all unique session IDs
    unique_session_ids = SessionKeyMetric.objects.values_list('session_id', flat=True).distinct()

    # Create a dictionary mapping all sessions ids to 0 initial score
    session_score_dict = {session_id: 0 for session_id in unique_session_ids}

    # Loop over all KeyMetric instances
    session_metrics_query = SessionKeyMetric.objects.all()
    for session_metric in session_metrics_query:
        # Grab the associated KeyMetric
        key_metric = KeyMetricTable.objects.get(id=session_metric.keymetric_id)
        # Add to the score
        session_score_dict[session_metric.session_id] += importance_score_dict[key_metric.importance]

    # Create a list of session ID, score pairs sorted by score in ascending order
    session_score_pairs = list(session_score_dict.items())
    session_score_pairs.sort(key=lambda x: x[1])

    worst_ids = [session_id for session_id, score in session_score_pairs[:n]]
    return worst_ids

# Returns a list of session ID, score pairs sorted by score in ascending order
def score_and_return_sessions():

    worst_ids = score_sessions_based_on_kpis(n=5)
    worst_sessions = SessionKeyMetric.objects.filter(session_id__in=worst_ids)
    session_score_dict = defaultdict(tree)
    
    for session_metric in worst_sessions:

        # Grab the associated KeyMetric
        key_metric = KeyMetricTable.objects.get(id=session_metric.keymetric_id)
        # Add to the score
        if(session_metric.session_id not in session_score_dict):
            filtered = df[df['session_id'] == session_metric.session_id]
            session_score_dict[session_metric.session_id]['summary'] = explain_session(filtered)
            session_score_dict[session_metric.session_id]['timestamp'] = filtered.iloc[0]['timestamp']
            session_score_dict[session_metric.session_id]['tags'] = []
        session_score_dict[session_metric.session_id]['tags'].append(key_metric.name)

    # Create a list of session ID, score pairs sorted by score in ascending order

    return session_score_dict

