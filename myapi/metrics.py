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

# get list of dates
def get_dates(clickhouse_client):
    dates_sql = """
    SELECT DISTINCT toStartOfDay(timestamp) AS date
    FROM {}.llm
    UNION ALL
    SELECT DISTINCT toStartOfDay(timestamp) AS date
    FROM {}.product
    ORDER BY date
    """.format(db_name, db_name)
    result = clickhouse_client.query(dates_sql)
    result_dict = [date for date in result.result_rows]
    return result_dict

# Helper function to get churned users
def convert_to_timedelta(time_str):
    # Assuming MM:DD HH:MM:SS format and treating each month as 30 days
    parts = time_str.split(" ")
    mm_dd = parts[0].split(":")
    hh_mm_ss = parts[1].split(":")
    
    # Extracting individual components
    months = int(mm_dd[0])
    days = int(mm_dd[1])
    hours = int(hh_mm_ss[0])
    minutes = int(hh_mm_ss[1])
    seconds = int(hh_mm_ss[2])
    
    # Convert months to days (approximation: 1 month = 30 days)
    total_days = days + (months * 30)
    
    # Creating timedelta object
    td = timedelta(days=total_days, hours=hours, minutes=minutes, seconds=seconds)
    return td

# Get churned users
def get_churned_users(timedelta_str="00:07 00:00:00"):
    today = datetime.datetime.now()
    timedelta_datetime = convert_to_timedelta(timedelta_str)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    def check_group(group):
        group = group.sort_values('timestamp')
        last = group.iloc[-1]
        if(today - last['timestamp'] < timedelta_datetime):
          return False
        else:
          return True

    # Group by session_id and apply the check_sequence function, then filter groups that return True.
    valid_users = df.groupby('user_id').filter(check_group)
    return set(valid_users['user_id'])

# given a list of events that are cared about (kpis), returns all sessions with all of those events
def find_sessions_with_kpis(df, event_names, in_order=False):
    # If "trace" is in event_names, we'll look for any 'llm' event type as well.
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    check_for_llm = 'trace' in event_names
    # if check_for_llm:
    #     # Remove 'trace' from event_names and prepare to check for 'llm' events.
    #     event_names = [e for e in event_names if e != 'trace']
        
    # Filter the DataFrame to only include rows with relevant event names or 'llm' event types.
    filtered_df = df[(df['event_name'].isin(event_names)) | (df['event_type'] == 'llm' if check_for_llm else False)]
    
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

    # Group by session_id and apply the check_sequence function, then filter groups that return True.
    valid_sessions = filtered_df.groupby('session_id').filter(check_sequence)
    
    # Return the unique session_ids of the valid sessions.
    return valid_sessions['session_id'].unique().tolist()