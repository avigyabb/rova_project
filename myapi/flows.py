from collections import defaultdict
import numpy as np
import pandas as pd
from .consts import *

# Returns all users and their sessions as nested objects
def events_to_traces(df):
    events = defaultdict(list)

    for (user_id, session_id), group in df.groupby(["user_id", "session_id"]):
        buffer = []
        for _, row in group.iterrows():
            row_dict = row.to_dict()
            if row_dict["table_source"] == "llm":
                buffer.append(row_dict)
            else:
                if buffer:
                    events[user_id].append(
                        {
                            "table_source": "llm",
                            "user_id": user_id,
                            "session_id": session_id,
                            "event_name": "trace",
                            "events": buffer,
                        }
                    )
                    buffer = []
                events[user_id].append(row_dict)
        if buffer:
            events[user_id].append(
                {
                    "table_source": "llm",
                    "user_id": user_id,
                    "session_id": session_id,
                    "event_name": "trace",
                    "events": buffer,
                }
            )

    return events


# Finds all paths between start and end per user
def find_paths(rova_data, start_event_name, end_event_name):
    paths = defaultdict(list)

    for user in rova_data.keys():

        events_per_user = rova_data[user]
        users_paths = []
        tracking = False
        current_path = []

        for event in events_per_user:
            if not tracking and event["event_name"] == start_event_name:
                tracking = True
                tracking_id = event["session_id"]
                current_path.append(event)

            elif tracking and tracking_id != event["session_id"]:
                current_path.append(
                    {
                        "user_id": user,
                        "timestamp": np.NaN,
                        "table_source": "product",
                        "event_name": "dropoff",
                        "session_id" : tracking_id,
                    }
                )
                tracking_id = -1
                users_paths.append(current_path)
                current_path = []
                tracking = False
                if event["event_name"] == start_event_name:
                    tracking = True
                    tracking_id = event["session_id"]
                    current_path.append(event)

            elif tracking and event["event_name"] == end_event_name:
                current_path.append(event)
                users_paths.append(current_path)
                current_path = []
                tracking = False

            elif tracking and event["session_id"] == tracking_id:
                current_path.append(event)

        if len(current_path) > 0:
            current_path.append(
                {
                    "user_id": user,
                    "timestamp": np.NaN,
                    "table_source": "product",
                    "event_name": "dropoff",
                    "session_id" : tracking_id,
                }
            )
            users_paths.append(current_path)
            
        paths[user] = users_paths

    return paths


# Finds all traces per user with specific event occuring at given step and beginning and ending with provided event names
def filter_paths(paths, step, event_name):
    filtered_paths = defaultdict(list)
    for user in paths.keys():
        for path in paths[user]:
            if (int(step) < len(path) - 1) and (
                path[step]["eventName"] == "event_name"
            ):
                filtered_paths[user].append(path)
    return filtered_paths

# num_steps includes start event and end event
def compute_percentages(paths, num_steps, end_event_name):
    paths = sorted(paths, key=len)

    start_path_index = 0

    # arrow_counts[i][key] is dictionary with src_event_name, dest_event_name, and percentage for arrow key with source at step i
    arrow_counts = dict()
    # arrow_percentages is a list of form [srcEventName + srcStep, destEventName + destStep, percentage]
    arrow_percentages = []

    # box_counts[i][key] is count of eventName key at step i
    box_counts = dict()
    # box percentages[i] is a list of [key, percentage] pairs: percentages for each eventName at ith step
    box_percentages = []

    num_steps = int(num_steps)

    for i in range(num_steps):
        box_counts[i] = defaultdict(int)
        box_percentages.append([])

    cur_step = 0
    total_percentage_remaining = 100
    for cur_step in range(num_steps):
        count = 0
        arrow_counts[cur_step] = dict()

        for path_index in range(start_path_index, len(paths)):
            path = paths[path_index]

            # check if all path's events have already been fully explored, if so, that path should not be considered in the future
            if cur_step > (len(path) - 1):
                start_path_index += 1
            else:
                src_event_name = path[cur_step]["event_name"]

                # boxes calculations
                # last step, skip to last event of this path
                if cur_step == (num_steps - 1):
                    box_counts[cur_step][path[len(path) - 1]["event_name"]] += 1
                # if not at first step and end event has been reached, skip to last step
                elif cur_step != 0 and src_event_name == end_event_name:
                    box_counts[num_steps - 1][src_event_name] += 1
                else:
                    box_counts[cur_step][src_event_name] += 1

                # arrows calculations
                # make sure there are at least two events left in the path to draw an arrow between
                if cur_step <= (len(path) - 2):
                    count += 1

                    # check if cur_step is the last step which is visible before end step
                    if cur_step == (num_steps - 2):
                        # make dest event be the last event in the path
                        dest_event_name = path[len(path) - 1]["event_name"]
                        key = "src:" + src_event_name + "->dest:" + dest_event_name
                        if key in arrow_counts[cur_step].keys():
                            arrow_counts[cur_step][key]["count"] += 1
                        else:
                            # make dest step be the last step
                            arrow_counts[cur_step][key] = {
                                "src_event_name": src_event_name,
                                "src_step": str(cur_step),
                                "dest_event_name": dest_event_name,
                                "dest_step": str(num_steps - 1),
                                "count": 1,
                            }
                    elif cur_step < (num_steps - 2):
                        dest_event_name = path[cur_step + 1]["event_name"]
                        key = "src:" + src_event_name + "->dest:" + dest_event_name

                        if key in arrow_counts[cur_step].keys():
                            arrow_counts[cur_step][key]["count"] += 1
                        # check if dest event is not end event
                        elif dest_event_name != end_event_name:
                            arrow_counts[cur_step][key] = {
                                "src_event_name": src_event_name,
                                "src_step": str(cur_step),
                                "dest_event_name": dest_event_name,
                                "dest_step": str(cur_step + 1),
                                "count": 1,
                            }
                        # dest event is end event, so make dest step be the last step
                        else:
                            arrow_counts[cur_step][key] = {
                                "src_event_name": src_event_name,
                                "src_step": str(cur_step),
                                "dest_event_name": dest_event_name,
                                "dest_step": str(num_steps - 1),
                                "count": 1,
                            }

        num_boxes = len(box_counts[cur_step].keys())
        total_space = 78 - 3 - 6 * (num_boxes - 1)
        box_counts_sum = sum(box_counts[cur_step].values())
        for key in box_counts[cur_step].keys():
            percentage = round(
                total_space * box_counts[cur_step][key] / box_counts_sum, 2
            )
            if percentage > 0:
                box_percentages[cur_step].append([key, percentage])
        # sort largest percentage to smallest
        box_percentages[cur_step] = sorted(
            box_percentages[cur_step], key=lambda box: box[1], reverse=True
        )

        if count > 0:
            count_continuing = 0
            for key in arrow_counts[cur_step].keys():
                cur_arrow = arrow_counts[cur_step][key]
                percentage = round(
                    total_percentage_remaining * cur_arrow["count"] / count, 2
                )
                if percentage > 0:
                    arrow_percentages.append(
                        [
                            cur_arrow["src_event_name"] + cur_arrow["src_step"],
                            cur_arrow["dest_event_name"] + cur_arrow["dest_step"],
                            str(percentage) + "%",
                        ]
                    )
                if (
                    cur_arrow["dest_event_name"] != "dropoff"
                    and cur_arrow["dest_event_name"] != end_event_name
                ):
                    count_continuing += cur_arrow["count"]
            total_percentage_remaining *= count_continuing / count
        elif cur_step < (num_steps - 1):
            # all paths have reached end event or dropoff, so skip to last step for final boxes
            cur_step = num_steps - 1
        else:
            cur_step += 1

    return arrow_percentages, box_percentages

def get_all_paths(paths):
    all_paths = []
    for user in paths.keys():
        all_paths += paths[user]
    return all_paths
