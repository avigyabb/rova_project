import rova_client  # this is the clickhouse client
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
import clickhouse_connect
import pandas as pd
import numpy as np
import os
from .traces import embed_all_traces
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
from categories.models import Category
from categories.views import assign_session_ids_to_category
import json

## Constants ##
embeddings_model = OpenAIEmbeddings(
    openai_api_key="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"
)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

# setup clickhouse client
def new_clickhouse_client():
    clickhouse_client = clickhouse_connect.get_client(
        host="tbbhwu2ql2.us-east-2.aws.clickhouse.cloud",
        port=8443,
        username="default",
        password="V8fBb2R_ZmW4i",
    )
    clickhouse_client.command('USE rova_dev')
    return clickhouse_client

clickhouse_client = new_clickhouse_client()

options_clickhouse_client = new_clickhouse_client()
filters_clickhouse_client = new_clickhouse_client()

db_name = "rova_dev"

rova_client = rova_client.Rova(db_name)

# Returns sql query to join dbs
combined_table_sql = """
    WITH CombinedData AS (
        SELECT
            'product' AS table_source,
            event_name,
            event_type,
            user_id,
            data_source_id,
            timestamp,
            session_id,
            CAST(distinct_id AS String) AS distinct_id,
            NULL AS trace_id,
            NULL AS input_content, -- Placeholder columns for llm table
            NULL AS output_content,
            NULL AS llm_in_use,
            NULL AS input_token_count,
            NULL AS output_token_count,
            NULL AS cost,
            NULL AS time_to_first_token,
            NULL AS latency,
            NULL AS error_status,
            NULL AS chat_id
        FROM
            {}.product

        UNION ALL

        SELECT
            'llm' AS table_source,
            event_name,
            event_type,
            user_id,
            data_source_id,
            timestamp,
            session_id,
            CAST(distinct_id AS String) AS distinct_id,
            trace_id,
            input_content,
            output_content,
            llm_in_use,
            input_token_count,
            output_token_count,
            cost,
            time_to_first_token,
            latency,
            error_status,
            chat_id
        FROM
            {}.llm
        
        ORDER BY
            timestamp
        )
    """.format(db_name, db_name)

def load_df_once():
    sql = """
        SELECT
            *
        FROM
            CombinedData
        """
    result = clickhouse_client.query(combined_table_sql + sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    if len(df) != 0:
        df = df.sort_values(by=["timestamp"])
    return df

df = load_df_once()

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

def query_gpt(
    client,
    msg_arr,
    model="gpt-4-turbo-preview",
    temperature=0.0,
    max_tokens=512,
    json_output=False,
):
    response_format = {"type": "json_object"} if json_output else {"type": "text"}

    response = client.chat.completions.create(
        model=model,
        messages=msg_arr,
        temperature=temperature,
        max_tokens=max_tokens,
        response_format=response_format,
        n=1,
        stop=None,
    )

    if json_output:
        return json.loads(response.choices[0].message.content)
    else:
        return response.choices[0].message.content
    
def prompt_to_generate_clusters(sentence):
    system_prompt = "You are a product analyst observing trends in user behaviors. Observe the following description of a session and identify 1) \
                     a category_name for sessions of this type and 2) a description of this category. Your output should be a JSON formatted object of the form \
                    {'name': 'category_name', 'description': 'category_description'}."
    msgs = [{"role": "system", "content": system_prompt}, {"role": "user", "content": "Here is a description of a session: {}".format(sentence)}]
    return msgs

def autosuggest_categories(df):
    if(Category.objects.count() == 0):
        #sessions_df = embed_all_sessions()
        embeddings = np.array(df["embeds"].tolist()) 
        # Clustering with K-Means
        kmeans = KMeans(n_clusters=2, random_state=0).fit(embeddings)
        # Assign cluster labels to DataFrame
        df['cluster_label'] = kmeans.labels_
        # Calculate the distance between each point and the centroid of its cluster
        centroids = kmeans.cluster_centers_
        distances = cdist(embeddings, centroids, 'euclidean')
        # The distance for each point to its cluster centroid
        df['distance_to_centroid'] = np.min(distances, axis=1)
        # Find the closest row to each cluster's centroid
        closest_rows = df.loc[df.groupby('cluster_label')['distance_to_centroid'].idxmin()]
        for row in closest_rows.iterrows():
            prompt = prompt_to_generate_clusters(row)
            answer = query_gpt(client, prompt, json_output=True)
            modded_name = answer['name'] +' (suggested)'
            new_category = Category(name=modded_name, description=answer['description'], user_id=0)
            new_category.save()
            assign_session_ids_to_category(modded_name, answer['description'], new_category.pk)

# Store the embeddings for all llm_events
llm_df = embed_llm_events()
traces_df = embed_all_traces(df, embeddings_model)
autosuggest_categories(llm_df)

# auto suggest
# 