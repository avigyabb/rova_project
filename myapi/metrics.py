import json
import pandas as pd
import numpy as np
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
        FROM buster_dev.llm
        UNION ALL
        SELECT toStartOfDay(timestamp) AS date, user_id
        FROM buster_dev.product
    )
    GROUP BY date
    ORDER BY date
    """
    result = clickhouse_client.query(dau_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict

# cost per day
def get_acpd(clickhouse_client):
    acpd_sql = """
    SELECT toStartOfDay(timestamp) AS date, SUM(cost) AS total_cost
    FROM buster_dev.llm
    GROUP BY date
    ORDER BY date
    """
    result = clickhouse_client.query(acpd_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict

# average latency per day
def get_alpd(clickhouse_client):
    alpd_sql = """
    SELECT toStartOfDay(timestamp) AS date, AVG(latency) AS average_latency
    FROM buster_dev.llm
    GROUP BY date, event_name
    ORDER BY date, event_name
    """
    result = clickhouse_client.query(alpd_sql)
    result_dict = {str(date.date()): count for date, count in result.result_rows}
    return result_dict