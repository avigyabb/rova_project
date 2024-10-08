from django.urls import path, include
from . import views

urlpatterns = [
    path("login-user/", views.login_user, name="login_user"),
    path("hello-world/", views.hello_world, name="hello_world"),
    path("get-sessions/", views.get_sessions, name="get_sessions"),
    path("get-session-events-given-session-ids/", views.get_session_events_given_session_ids, name = "get_session_events_given_session_ids"),
    path("get-user/", views.get_user, name="get_user"),
    path("get-fpaths/", views.get_fpaths, name="filter_paths"),
    path("get-histogram/", views.get_histogram, name="get_histogram"),
    path("get-metrics/", views.get_metrics, name="get_metrics"),
    path("get-processed-query/", views.get_processed_query, name="get_processed_query"),
    path("get-sessions-at-step/", views.get_sessions_at_step, name="get_sessions_at_step"),
    path("get-percentages/", views.get_percentages, name="get_percentages"),
    path("get-options/", views.get_options, name="get_options"),
    path("get-summary/", views.get_summary, name="get_summary"),
    path("track/", views.track_event, name="track_event"),
    path("get-user-keymetrics/", views.get_user_keymetrics, name="get_user_keymetrics"),
    path("get-similar-traces/", views.get_similar_traces, name="get_similar_traces"),
    path("post-user-keymetric/", views.post_user_keymetric, name="post_user_keymetric"),
    path("delete-user-keymetric/", views.delete_user_keymetric, name="delete_user_keymetric"),
    path("get-filtered-sessions/", views.get_filtered_sessions, name="get_filtered_sessions"),
    path("get-surfaced-sessions/", views.get_surfaced_sessions, name="get_surfaced_sessions"),
    path("post-user-session-score/", views.post_user_session_score, name="post_user_session_score"),
    path("get-user-session-score/", views.get_user_session_score, name="get_user_session_score"),
    path("check-data-has-changed/", views.check_data_has_changed, name="check_data_has_changed"),
]
