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

"""
Returns the number of active users (defined as
users who have performed an event from the given 
events list) at each time interval 
"""
def num_active_users(path_to_journeys, events, time_interval):
    df = get_df_from_json(path_to_journeys)

    # Filter for rows where 'eventName' is in 'events'
    events = events.split(",")
    df_filtered = df[df["eventName"].isin(events)]

    # Round 'timestamp' to 'time_interval'
    df_filtered["rounded_timestamp"] = df_filtered["timestamp"].dt.round(time_interval)
    df_filtered["rounded_timestamp"] = df_filtered["rounded_timestamp"].dt.strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # Group by 'rounded_timestamp' and 'userId'
    df_result = (
        df_filtered.groupby(["rounded_timestamp", "userId"]).first().reset_index()
    )

    # Count the number of unique 'userId' at each 'rounded_timestamp'
    rounded_timestamp_counts = (
        df_result["rounded_timestamp"].value_counts(sort=False).to_dict()
    )
    return rounded_timestamp_counts