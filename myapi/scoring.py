
from .consts import *
from .traces import *
from .callgpt import explain_session_by_kpis, query_gpt
from .metrics import get_churned_sessions
from django.db.models import Count
from keymetrics.models import KeyMetricTable, SessionKeyMetric

# Dictionary that maps importance texts to score
importance_score_dict = {
    "Very Negative": -1,
    "Negative": -0.4,
    "Neutral": 0,
    "Positive": 0.4,
    "Very Positive" : 1
}

# Returns a list of session ID, score pairs sorted by score in ascending order
def score_sessions_based_on_kpis():

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

    return session_score_pairs

