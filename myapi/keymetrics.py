
from .callgpt import *
from .consts import *
import numpy as np

keymetrics = [{"name": "NAME", "description": "DESCRIPTION", "importance": 0,"session_ids": [], "num_events": 0}]

# Add a new category
def add_keymetric(name, description, importance):
    new_keymetric = {"name": name, "description": description, "session_ids": [], "num_events": 0}
    new_keymetric["session_ids"] = find_sessions_with_kpis(df, [name], False)
    new_keymetric["importance"] = importance
    new_keymetric["num_events"] = len(new_keymetric['session_ids'])
    keymetrics.append(new_keymetric)

# Get all keymetrics
def get_keymetrics():
    return keymetrics

# function to delete a keymetric from the list
def delete_keymetric(index):
    print("index",index)
    keymetrics.pop(len(keymetrics) - int(index) - 1) # when displaying categories index is reversed

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