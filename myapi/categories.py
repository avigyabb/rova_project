# User-defined categories
from .callgpt import *
from .consts import *
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Stores the user-defined categories and distinct event ids that correspond to it
categories = [{"name": "NAME", "description": "DESCRIPTION", "session_ids": [], "num_events": 0}]
keymetrics = [{"name": "NAME", "description": "DESCRIPTION", "importance": 0,"session_ids": [], "num_events": 0}]

# Returns a dictionary mapping the number of events in each category over time
def get_trend_for_category(time_range, category):
    # Grab time, category columns
    selected_columns = llm_df[[category['name'], 'timestamp']]
    # Sort by timestamp and group by time range
    llm_df_sorted = selected_columns.sort_values(by='timestamp')
    llm_df_sorted.set_index('timestamp', inplace=True)
    # counts = llm_df_sorted.resample(time_range).sum()
    # counts_dict = counts['boolean_column'].to_dict()
    return llm_df_sorted

# Add a new category
def add_category(name, description):
    new_category = {"name": name, "description": description, "session_ids": [], "num_events": 0}
    new_category["session_ids"] = assign_session_ids_to_category(new_category)
    new_category["num_events"] = llm_df[name].sum()
    print(get_trend_for_category("1D", new_category))
    categories.append(new_category)

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

# Get all categories
def get_categories():
    return categories

# function to delete a category from the list
def delete_category(index):
     # remove the category from the llm_df
    category = categories[len(categories) - int(index) - 1]
    llm_df = llm_df.drop(columns=[category['name']])
    categories.pop(len(categories) - int(index) - 1) # when displaying categories index is reversed

# function to delete a keymetric from the list
def delete_keymetric(index):
    print("index",index)
    keymetrics.pop(len(keymetrics) - int(index) - 1) # when displaying categories index is reversed

# Embed the category description and add all session ids
def assign_session_ids_to_category(category, similarity_threshold=0.66):
    # Embed the category description
    category_embedding = np.array(embeddings_model.embed_documents([category["description"]]))[0]
    category_embedding = category_embedding.reshape(1, -1)

    # Find similarity between the category description and the llm events
    llm_df[category['name']] = cosine_similarity(category_embedding, list(llm_df['embeds'])).flatten()
    llm_df[category['name']] = llm_df[category['name']] > similarity_threshold

    # Find all session ids that have a similarity above the threshold
    unique_session_ids = llm_df[llm_df[category['name']]]['session_id'].unique()
    return unique_session_ids

def update_categories_with_new_event(row):
    # Get embedding for this new row
    row['event_text'] = 'Event name: ' + row['event_name'] + \
                        '\n Input: ' + row['input_content'] + \
                        '\n Output: ' + row['output_content']
    row['embeds'] = np.array(embeddings_model.embed_documents([row['event_text']]))[0]

    for category in categories:
        # Determine if the event is in the category
        category_embedding = np.array(embeddings_model.embed_documents([category["description"]]))[0]
        category_embedding = category_embedding.reshape(1, -1)
        row[category['name']] = cosine_similarity(category_embedding, row['embeds'].reshape(1, -1))[0][0] > 0.66

        # If the event in the category, add the session id to the list
        if row[category['name']]:
            if row['session_id'] not in category['session_ids']:
                category['session_ids'].append(row['session_id'])
            category['num_events'] += 1

    llm_df.append(row, ignore_index=True)

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

def get_session_ids_given_filters(included_categories, excluded_categories, included_signals, excluded_signals, engagement_time):
    sql_query = (
        """
        SELECT session_id, user_id, MAX(timestamp) AS last_timestamp
        FROM CombinedData AS t1
        """
    )
    if len(included_signals) > 0:
        sql_query += (
            """
            WHERE session_id IN (
                SELECT session_id
                FROM CombinedData AS t2
                WHERE t2.event_name IN ("""
                + ", ".join([f"'{included_signal}'" for included_signal in included_signals])
                + """)
                )
            """
        )
        if len(excluded_signals) > 0:
            sql_query += (
                """    
                AND session_id NOT IN (
                    SELECT session_id
                    FROM CombinedData AS t3
                    WHERE t3.event_name IN ("""
                    + ", ".join([f"'{excluded_signal}'" for excluded_signal in excluded_signals])
                    + """)
                    )
                """
            )   
    elif len(excluded_signals) > 0:
        sql_query += (
            """
            WHERE session_id NOT IN (
                SELECT session_id
                FROM CombinedData AS t2
                WHERE t2.event_name IN ("""
                + ", ".join([f"'{excluded_signal}'" for excluded_signal in excluded_signals]) 
                + """)
                )
            """
        ) 
    if int(engagement_time) > 0:
        sql_query += (
            """
            HAVING DATEADD(day, {}, last_timestamp) <= CURRENT_TIME()
            """
        )
    sql_query += (
        """
        GROUP BY session_id, user_id
        """
    )
    result = filters_clickhouse_client.query(combined_table_sql + sql_query)
    df = pd.DataFrame(data = result.result_rows, columns = result.column_names)
    if len(df) == 0:
        return []
    return df["session_id"].unique().tolist()
