from .callgpt import *
from .consts import *
import pandas as pd


def process_session_query(gptclient, query):
    response = query_gpt(gptclient, build_sessions_sql_prompt(query))
    return response


# Returns the session data for the given session ids
def get_session_data_from_ids(clickhouse_client, session_ids):

    sql = (
        """
        SELECT session_id, user_id, MIN(timestamp) AS earliest_timestamp
        FROM CombinedData
        WHERE session_id IN ("""
        + ", ".join([f"{session_id}" for session_id in session_ids])
        + """)
        GROUP BY session_id, user_id
        """
    )
    result = clickhouse_client.query(combined_table_sql + sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    # Check if nothing returned in the query
    if len(df) == 0:
        return {}
    df = df.sort_values(by="earliest_timestamp", ascending=False)
    df["earliest_timestamp"] = df["earliest_timestamp"].astype(str)
    return df.to_dict(orient="records")


def get_all_paths(paths):
    all_paths = []
    for user in paths.keys():
        all_paths += paths[user]
    return all_paths


# Finds all traces per user with specific event occuring at given step and beginning and ending with provided event names
def get_session_ids_given_step(paths, step, num_steps, event_name):
    session_ids = []
    for path in paths:
        # step given is last step (end event), so last event in path must be the given event
        # dropoff can occur at earlier step than last step so doesn't count if event_name is "dropoff"
        if (
            step == (num_steps - 1)
            and path[len(path) - 1]["event_name"] == event_name
            and event_name != "dropoff"
        ):
            session_ids.append(path[len(path) - 1]["session_id"])
        # if step == num_steps - 1 and event_name is "dropoff", this check still applies
        elif step < len(path) and path[step]["event_name"] == event_name:
            session_ids.append(path[step]["session_id"])
        # case where "dropoff" at num_steps - 1 is selected
        elif (
            step == (num_steps - 1)
            and event_name == "dropoff"
            and path[len(path) - 1] == "dropoff"
        ):
            session_ids.append(path[len(path) - 1]["session_id"])
    return session_ids
