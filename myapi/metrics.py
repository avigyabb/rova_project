import json
import pandas as pd
import numpy as np
from .consts import *
from datetime import timedelta
import datetime 

# Return the df corresponding to a JSON file
def get_df_from_json(path):
    dictionaries = []

    # Open your file
    with open(path, "r") as file:
        # Iterate over each line
        dictionaries = json.load(file)

    # Now 'dictionaries' is a list of dictionaries, each representing a line in your file
    df = pd.DataFrame(dictionaries)

    # Convert 'timestamp' to datetime if not already
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df

# daily active users
def get_dau(clickhouse_client):
    dau_sql = """
    SELECT date, COUNT(DISTINCT user_id) AS daily_active_users
    FROM (
        SELECT toStartOfDay(timestamp) AS date, user_id
        FROM {}.llm
        UNION ALL
        SELECT toStartOfDay(timestamp) AS date, user_id
        FROM {}.product
    )
    GROUP BY date
    ORDER BY date
    """.format(db_name, db_name)
    result = clickhouse_client.query(dau_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict

# cost per day
def get_acpd(clickhouse_client):
    acpd_sql = """
    SELECT toStartOfDay(timestamp) AS date, SUM(cost) AS total_cost
    FROM {}.llm
    GROUP BY date
    ORDER BY date
    """.format(db_name)
    result = clickhouse_client.query(acpd_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict

# average latency per day
def get_alpd(clickhouse_client):
    alpd_sql = """
    SELECT toStartOfDay(timestamp) AS date, AVG(latency) AS average_latency
    FROM {}.llm
    GROUP BY date
    ORDER BY date
    """.format(db_name)
    result = clickhouse_client.query(alpd_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict

def get_asdpd(clickhouse_client):
    asdpd_sql = """
    SELECT
        session_date,
        AVG(session_duration) as avg_session_duration
    FROM (
        SELECT
            toDate(MIN(timestamp)) as session_date,
            session_id,
            dateDiff('second', MIN(timestamp), MAX(timestamp)) as session_duration
        FROM (
            SELECT session_id, timestamp
            FROM {}.llm
            UNION ALL
            SELECT session_id, timestamp
            FROM {}.product
        )
        GROUP BY
            session_id
    )
    GROUP BY
        session_date
    ORDER BY
        session_date

    """.format(db_name, db_name)
    result = clickhouse_client.query(asdpd_sql)
    result_dict = {str(date): count for date, count in result.result_rows}
    return result_dict

# Get churned sessions
def get_churned_sessions(df, timedelta_str="0 days 00:30:00"):
    # Convert the timedelta string to a pandas.Timedelta object
    timedelta_datetime = pd.to_timedelta(timedelta_str)
    
    # Ensure timestamp is in datetime format
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Sort the DataFrame by 'sessions' and then by 'timestamp' to ensure the order
    df = df.sort_values(by=['session_id', 'timestamp'])
    prev_max_timestamp = None
    churned_sessions = []
    for session_id, group in df.groupby('session_id'):
        # Check if there is a previous group to compare with
        if prev_max_timestamp is not None:
            # Calculate the time difference between the current group's min timestamp and the previous group's max timestamp
            time_diff = group['timestamp'].min() - prev_max_timestamp
            # If the time difference is greater than the specified timedelta, add the session to the list
            if time_diff > timedelta_datetime:
                churned_sessions.append(session_id)

        # Update the prev_max_timestamp with the max timestamp of the current group
        prev_max_timestamp = group['timestamp'].max()
      
    return set(churned_sessions)