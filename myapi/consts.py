from rova_client import Rova
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
import clickhouse_connect
import pandas as pd
import numpy as np
import os
from .traces import embed_all_traces
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import json

## Constants ##
embeddings_model = OpenAIEmbeddings(
    openai_api_key="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"
)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

db_name = "rova_dev"
global_period = 7 # 7 days churn

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
    result = clickhouse_client.query(combined_table_sql + sql)
    df = pd.DataFrame(data=result.result_rows, columns=result.column_names)
    if len(df) != 0:
        df = df.sort_values(by=["timestamp"])
    return df

df = load_df_once()

# Creates embeddings for all llm events
def embed_llm_events():
    # Grab the llm events
    if len(df) == 0:
        return []
    llm_df = df[df['event_type'] == 'llm']
    llm_df['event_text'] = 'Event name: ' + llm_df['event_name'] + \
                        '\n Input: ' + llm_df['input_content'] + \
                        '\n Output: ' + llm_df['output_content']

    embeds = np.array(embeddings_model.embed_documents(llm_df['event_text'].to_list()))
    llm_df['embeds'] = [np.array(e) for e in embeds]
    return llm_df

# Store the embeddings for all llm_events
llm_df = embed_llm_events()
traces_df = embed_all_traces(df, embeddings_model)
