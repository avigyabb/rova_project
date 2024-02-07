import pandas as pd
import json
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
import clickhouse_connect

from .sessions import *
from .topk import *
from .flows import *
from .metrics import *

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
import rova_client  # this is the clickhouse client

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
rova_client = rova_client.Rova("buster_dev", )


@csrf_exempt
@require_POST
def track_event(request):
    try:
        data = json.loads(request.body)
        rova_client.capture(data)
        # Process your data here, e.g., save it to the database or perform other logic
        # print(data)  # Example to print the data received
        return JsonResponse(
            {"status": "success", "message": "Event tracked successfully."}
        )
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)


def load_df_once():
    sql = """
        SELECT
            *
        FROM
            CombinedData
        """
    result = clickhouse_client.query(combined_table_sql + sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    if len(df) != 0:
        df = df.sort_values(by=["timestamp"])
    return df


df = load_df_once()


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

    events = df_to_user_events_by_user(df)
    paths = find_paths(events, startEvent, endEvent)

    step_num = request.GET.get("step_num")
    num_steps = request.GET.get("num_steps")
    event_name = request.GET.get("event_name")
    session_ids = get_session_ids_given_step(
        paths, int(step_num), int(num_steps), event_name
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
    dates = get_dates(clickhouse_client)
    return Response(
        {
            "lines": [
                ("Daily Active Users", dau),
                ("Average Cost Per Day", acpd),
                ("Average Latency per Day", alpd),
            ],
            "dates":dates
        }
    )


# client-server comm for finding processed query
@api_view(["GET"])
def get_processed_query(request):
    query = request.GET.get("query")
    return Response({"processed_query": process_session_query(client, query)})


@api_view(["GET"])
def get_percentages(request):
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
      FROM buster_dev.product
    """
    options = clickhouse_client.query(sql_query).result_rows
    options.append("LLM Trace")
    return Response({"options": options})
