import json
import pandas as pd
import numpy as np

db_name = "rova_dev"
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