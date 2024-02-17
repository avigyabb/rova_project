from rova_client import Rova
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
import clickhouse_connect
import pandas as pd
import numpy as np
import os
from .traces import embed_all_traces, embed_all_sessions
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import umap.umap_ as umap
from datetime import datetime
import json
import hdbscan

## Constants ##
embeddings_model = OpenAIEmbeddings(
    openai_api_key="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"
)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

db_name = "rova_dev"
global_period = 7 # 7 days churn

mapping = {'Very Negative': 1, 'Negative': 2, 'Neutral': 3, 'Positive': 4, 'Very Positive': 5}
inverse_mapping = {1: 'Very Negative', 2: 'Negative', 3: 'Neutral', 4: 'Positive', 5: 'Very Positive'}

# setup clickhouse client
def new_clickhouse_client():
    clickhouse_client = clickhouse_connect.get_client(
        host="tbbhwu2ql2.us-east-2.aws.clickhouse.cloud",
        port=8443,
        username="default",
        password="V8fBb2R_ZmW4i",
    )
    clickhouse_client.command('USE {}'.format(db_name))
    return clickhouse_client

clickhouse_client = new_clickhouse_client()

options_clickhouse_client = new_clickhouse_client()
filters_clickhouse_client = new_clickhouse_client()

rova_client = Rova(db_name)

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
    client = new_clickhouse_client()
    result = client.query(combined_table_sql + sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    if len(df) != 0:
        df = df.sort_values(by=["timestamp"])
    return df

# Dimension reduction, clustering models for llm events
umap_llm_model = umap.UMAP(n_neighbors=15, n_components=10, min_dist=0.1, metric='cosine')
llm_clusterer = hdbscan.HDBSCAN(min_cluster_size=5, metric='euclidean', cluster_selection_method='eom', prediction_data=True)

# Get question from event_text
def get_question(input, output):
    to_remove = "Determine what type of task needs to be performed for this user and call the appropriate function from your toolbox."
    return input.replace(to_remove, "")

# Creates embeddings for all llm events
def embed_llm_events(df):
    # Grab the llm events
    if len(df) == 0:
        return []
    llm_df = df[df['event_type'] == 'llm']
    llm_df = llm_df[llm_df['event_name'] == 'classify_intent']
    llm_df['event_text'] = get_question(llm_df['input_content'], llm_df['output_content'])

    # Embed the llm events and reduce dimension
    embeds = np.array(embeddings_model.embed_documents(llm_df['event_text'].to_list()))
    umap_llm_model.fit(embeds)
    embeddings_5d = umap_llm_model.transform(embeds)
    llm_df['embeds'] = [e for e in embeddings_5d]
    return llm_df

class DataframeLoader:
    _dataframes = {}
    _trackchanges = None
    @classmethod
    def get_dataframe(cls, key):
        if key not in cls._dataframes:
            # Lazy initialization logic here
            # For example, load from a file or database
            if(key == 'df'):
                cls._dataframes[key] = load_df_once()
            elif(key == 'llm_df'):
                if('df' not in cls._dataframes):
                    cls._dataframes['df'] = load_df_once()
                cls._dataframes[key] = embed_llm_events(cls._dataframes['df'])
            elif(key == 'traces_df'):
                if('df' not in cls._dataframes):
                    cls._dataframes['df'] = load_df_once()
                cls._dataframes[key] = embed_all_traces(cls._dataframes['df'], embeddings_model)
            elif(key == 'sessions_df'):
                if('df' not in cls._dataframes):
                    cls._dataframes['df'] = load_df_once()
                cls._dataframes[key] = embed_all_sessions(cls._dataframes['df'], embeddings_model)
        return cls._dataframes[key]
    
    @classmethod
    def set_dataframe(cls, key, df):
        cls._dataframes[key] = df

    @classmethod
    def get_trackchanges(cls):
        return cls._trackchanges

    @classmethod
    def set_trackchanges(cls, datetime_obj):
        cls._trackchanges = datetime_obj

