import rova_client  # this is the clickhouse client
from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
import clickhouse_connect
import os

## Constants ##
embeddings_model = OpenAIEmbeddings(
    openai_api_key="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"
)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

# setup clickhouse client
clickhouse_client = clickhouse_connect.get_client(
    host="tbbhwu2ql2.us-east-2.aws.clickhouse.cloud",
    port=8443,
    username="default",
    password="V8fBb2R_ZmW4i",
)
clickhouse_client.command('USE rova_dev')

rova_client = rova_client.Rova("buster_dev")

db_name = "rova_dev"

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
