import pandas as pd
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .sessions import *
from .topk import *
from .flows import *
from .metrics import *
from .consts import *
from .categories import *
from .callgpt import *
from .traces import *
from .keymetrics import *
from .scoring import *
from categories.views import *
from keymetrics.models import SessionsToScores

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from rest_framework import status
from datetime import datetime
import pytz

@csrf_exempt
@require_POST
def login_user(request):
    data = json.loads(request.body)
    user = authenticate(request, username=data['username'], password=data['password'])
    if user is not None:
        login(request, user)
        DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
        return JsonResponse({'message': "Login successful", "status":status.HTTP_200_OK})
    else:
        # Return an 'invalid login' error message.
        DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
        return JsonResponse({"error": 'Invalid Credentials', "status":status.HTTP_401_UNAUTHORIZED})

# Appends the newest event to the df
def add_most_recent_event():
    sql = """
        SELECT
            *
        FROM
            CombinedData
        ORDER BY timestamp DESC
        LIMIT 1
        """
    result = clickhouse_client.query(combined_table_sql + sql)
    new_row = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    df = DataframeLoader.get_dataframe('df')
    df.append(new_row.iloc[0], ignore_index=True)
    update_categories_with_new_event(df, new_row.iloc[0])
    add_keymetric_for_new_session(df, new_row.iloc[0]['session_id'])
    if('trace_id' in new_row.columns and new_row.iloc[0]['trace_id'] is not None):
        traces_df = embed_all_traces(df, embeddings_model, traces_df=traces_df, new_trace=new_row.iloc[0]['trace_id'])

@csrf_exempt
@require_POST
def track_event(request):
    try:
        data = json.loads(request.body)
        rova_client.capture(data)
        # Process your data here, e.g., save it to the database or perform other logic
        # print(data)  # Example to print the data received
        #add_most_recent_event()
        DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
        return JsonResponse(
            {"status": "success", "message": "Event tracked successfully."}
        )
    except json.JSONDecodeError:
        DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)


# Simple function to test CS communication
@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello, world!"})


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


@api_view(["GET"])
def get_sessions_at_step(request):
    startEvent = request.GET.get("start_event")
    endEvent = request.GET.get("end_event")
    df = DataframeLoader.get_dataframe("df")
    events = df_to_user_events_by_user(df)
    paths = find_paths(events, startEvent, endEvent)

    step_num = request.GET.get("step_num")
    num_steps = request.GET.get("num_steps")
    event_name = request.GET.get("event_name")
    session_ids = get_session_ids_given_step(
        get_all_paths(paths), int(step_num), int(num_steps), event_name
    )
    sessions = get_session_data_from_ids(clickhouse_client, session_ids)
    return Response({"sessions": sessions})


# client-server comm for finding trace sessions for all users
@api_view(["GET"])
def get_sessions(request):
    sessions = []
    sql_query = request.GET.get("sql")
    if sql_query:
        sessions = clickhouse_client.query(sql_query).result_rows
    sessions = [session[0] for session in sessions]
    sessions_data = get_session_data_from_ids(clickhouse_client, sessions)
    return Response({"sessions": sessions_data})


# client-server comm for finding trace sessions for specific user
@api_view(["GET"])
def get_user(request):
    if int(request.GET.get("sessionId")) >= 0:
        sql_query = f"""
            SELECT *
            FROM CombinedData
            WHERE user_id = '{request.GET.get("userId")}' AND session_id = '{request.GET.get("sessionId")}'
            """
    else:
        sql_query = f"""
            SELECT *
            FROM CombinedData
            WHERE user_id = '{request.GET.get("userId")}'
            """
    result = clickhouse_client.query(combined_table_sql + sql_query)
    # dataframe of all events of user ordered by timestamp
    if (len(result.result_rows) == 0):
        return Response({"info": []})
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names).sort_values(
        by=["timestamp"]
    )
    output = df_to_user_events(df)
    return Response({"info": output})


def df_to_user_events(df):
    user_events = []
    completed_events = set()
    for index, row in df.iterrows():
        if row["table_source"] == "llm" and row["trace_id"] not in completed_events:
            completed_events.add(row["trace_id"])
            trace_id_filtered_df = df[df["trace_id"] == row["trace_id"]]
            buffer_dict = {
                "table_source": "llm",
                "event_name": "LLM Trace",
                "timestamp": row["timestamp"],
                "error_ocurred": False,
                "events": [],
                "user_id": row["user_id"],
                "session_id": row["session_id"],
            }
            for index, filtered_row in trace_id_filtered_df.iterrows():
                if (
                    filtered_row["error_status"] != "none"
                    and filtered_row["error_status"] != ""
                ):
                    buffer_dict["error_ocurred"] = True

                try:
                    input_dict = json.loads(filtered_row["input_content"])
                    input_dict = input_dict[0]
                    filtered_row["input_content"] = ""
                    for key in input_dict:
                        filtered_row["input_content"] += (
                            key + ": " + input_dict[key] + "\n"
                        )
                except Exception:
                    pass

                try:
                    output_dict = json.loads(filtered_row["output_content"])
                    filtered_row["output_content"] = ""
                    for key in output_dict:
                        filtered_row["output_content"] += (
                            key + ": " + output_dict[key] + "\n"
                        )
                except Exception:
                    pass

                event_dict = {
                    k: None if pd.isna(v) else v
                    for k, v in filtered_row.to_dict().items()
                }
                buffer_dict["events"].append(event_dict)
            user_events.append(buffer_dict)
        elif row["table_source"] == "product":
            # Convert row Series to dict and replace NaN with None for single rows as well
            user_events.append(
                {k: None if pd.isna(v) else v for k, v in row.to_dict().items()}
            )

    return user_events


def df_to_user_events_by_user(df):
    user_events = df_to_user_events(df)

    user_events_by_user = defaultdict(list)
    for event in user_events:
        user_events_by_user[event["user_id"]].append(event)
    return user_events_by_user


# client-server comm for finding histogram
@api_view(["GET"])
def get_histogram(request):
    histogram = generate_histogram(embeddings_model, client, 5)
    return Response({"histogram": histogram})


# client-server comm for finding num active users
@api_view(["GET"])
def get_metrics(request):
    dau = get_dau(clickhouse_client)
    acpd = get_acpd(clickhouse_client)
    alpd = get_alpd(clickhouse_client)
    asdpd = get_asdpd(clickhouse_client)
    return Response(
        {
            "lines": [
                ("Daily Active Users", dau),
                ("Average Cost per Day", acpd),
                ("Average Latency per Day", alpd),
                ("Average Session Length per Day", asdpd),
            ],
        }
    )


# client-server comm for finding processed query
@api_view(["GET"])
def get_processed_query(request):
    query = request.GET.get("query")
    return Response({"processed_query": process_session_query(client, query)})


@api_view(["GET"])
def get_percentages(request):
    df = DataframeLoader.get_dataframe('df')
    events = df_to_user_events_by_user(df)

    start_event_name = request.GET.get("start_event_name")
    end_event_name = request.GET.get("end_event_name")

    paths = find_paths(events, start_event_name, end_event_name)
    arrow_percentages, box_percentages = compute_percentages(
        get_all_paths(paths), request.GET.get("num_steps"), end_event_name
    )
    return Response(
        {"arrow_percentages": arrow_percentages, "box_percentages": box_percentages}
    )


@api_view(["GET"])
def get_options(request):
    sql_query = """
      SELECT DISTINCT event_name
      FROM {}.product
    """.format(
        db_name
    )
    options = options_clickhouse_client.query(sql_query).result_rows
    return Response({"options": options})

@api_view(["GET"])
def get_user_keymetrics(request):
    keymetrics = get_keymetrics(request.user)
    return Response({"keymetrics": keymetrics})


@api_view(["GET"])
def get_summary(request):
    trace_id = request.GET.get("trace_id")
    df = DataframeLoader.get_dataframe('df')
    messages = explain_trace(df, trace_id)
    summary = query_gpt(
        client,
        messages,
        model="gpt-3.5-turbo-0125",
        max_tokens=100,
        temperature=0,
        json_output=False,
    )
    return Response({"summary": summary})

@api_view(["GET"])
def get_similar_traces(request):
    traces_df = DataframeLoader.get_dataframe('traces_df')
    trace_id = int(request.GET.get("trace_id"))
    similar = find_similar(trace_id, traces_df)
    return Response({"similar_traces": similar})

@csrf_exempt
@require_POST
def post_user_keymetric(request):
    data = json.loads(request.body)
    user_id = data.get("name")
    category = data.get("description")
    importance = data.get("importance")
    period = data.get('period')
    add_keymetric(request.user, user_id, category, importance, period)
    DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
    return JsonResponse({"message": "Category added successfully"})

@api_view(["GET"])
def delete_user_keymetric(request):
    index = request.GET.get("index")
    delete_keymetric(request.user, index)
    DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
    return Response({"message": "Category deleted successfully"})


@api_view(["GET"])
def get_filtered_sessions(request):
    included_categories = json.loads(request.GET.get("included_categories"))
    excluded_categories = json.loads(request.GET.get("excluded_categories"))
    included_signals = json.loads(request.GET.get("included_signals"))
    excluded_signals = json.loads(request.GET.get("excluded_signals"))
    engagement_time = request.GET.get("engagement_time")
    
    session_ids = get_session_ids_given_filters(request.user, included_categories, excluded_categories,
                                                included_signals, excluded_signals,
                                                engagement_time)

    if session_ids == []:
        return Response({"sessions" : {}})
    return Response({"sessions" : get_session_data_from_ids(clickhouse_client, session_ids)})

@api_view(["GET"])
def get_surfaced_sessions(request):
    sessions_obj = score_and_return_sessions(request.user)
    return Response({"sessions" : sessions_obj})

@csrf_exempt
@require_POST
def post_user_session_score(request):
    data = json.loads(request.body)
    session_id = data.get("params").get("session_id")
    score = int(mapping[data.get("params").get("score")])
    instance, created = SessionsToScores.objects.get_or_create(user=request.user, session_id=session_id)
    instance.user_score = score
    instance.save()
    DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
    return JsonResponse({"message": "Category added successfully"})

@api_view(['GET'])
def get_user_session_score(request):
    session_id = int(request.GET.get('session_id'))
    instance, created = SessionsToScores.objects.get_or_create(user=request.user, session_id=session_id)
    if(not created and instance.user_score is not None):
        score = inverse_mapping[instance.user_score]
    else:
        score = 'Neutral'
    instance.user_score = mapping[score]
    instance.save()
    return Response({"score": score})

@api_view(["GET"])
def check_data_has_changed(request):
    datetime_from_frontend = request.GET.get('lastUpdateTimestamp')
    datetime_from_frontend = datetime_from_frontend.replace('Z', '+00:00')
    parsed_date = datetime.fromisoformat(datetime_from_frontend)
    datetime_from_backend = DataframeLoader.get_trackchanges()
    if(datetime_from_backend is None):
        DataframeLoader.set_trackchanges(datetime.now(pytz.utc))
        return Response({"hasChanged": True})
    elif(datetime_from_backend > parsed_date):
        return Response({"hasChanged": True})
    else:
        return Response({"hasChanged": False})