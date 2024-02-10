# User-defined categories
from .callgpt import *
from .consts import *
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Creates embeddings for all llm events
def embed_llm_events():
    # Grab the llm events
    llm_df = df[df['event_type'] == 'llm']
    llm_df['event_text'] = 'Event name: ' + llm_df['event_name'] + \
                        '\n Input: ' + llm_df['input_content'] + \
                        '\n Output: ' + llm_df['output_content']

    embeds = np.array(embeddings_model.embed_documents(llm_df['event_text'].to_list()))
    llm_df['embeds'] = [np.array(e) for e in embeds]
    return llm_df

# Store the embeddings for all llm_events
llm_df = embed_llm_events()

# Stores the user-defined categories and distinct event ids that correspond to it
categories = [{"name": "NAME", "description": "DESCRIPTION", "session_ids": []}]

# Add a new category
def add_category(name, description):
    new_category = {"name": name, "description": description, "session_ids": []}
    new_category = assign_session_ids_to_category(new_category)
    categories.append(new_category)

# Get all categories
def get_categories():
    return categories

# function to delete a category from the list
def delete_category(index):
    categories.pop(len(categories) - int(index) - 1) # when displaying categories index is reversed

# Embed the category description and add all session ids
def assign_session_ids_to_category(category, similarity_threshold=0.66):
    # Embed the category description
    category_embedding = np.array(embeddings_model.embed_documents([category["description"]]))[0]
    category_embedding = category_embedding.reshape(1, -1)

    # Find similarity between the category description and the llm events
    llm_df[category['name']] = cosine_similarity(category_embedding, list(llm_df['embeds'])).flatten()

    # Find all session ids that have a similarity above the threshold
    unique_session_ids = llm_df[llm_df[category['name']] > similarity_threshold]['session_id'].unique()
    category["session_ids"] = unique_session_ids.to_list()
    return category

def get_session_ids_given_filters(topics, kpis, users):
    sql_query = f"""
        SELECT *
        FROM CombinedData
        WHERE user_id IN {users}
        """
    result = clickhouse_client.query(combined_table_sql + sql_query)
    df = pd.DataFrame(data = result.result_rows, columns = result.column_names).sort_values(
        by = ["timestamp"]
    )

