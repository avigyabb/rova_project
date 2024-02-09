# Asks ChatGPT to identify topics
import json
from .consts import *

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


# Builds prompt to categorize questions
def build_topics_prompt(samples):
    system_prompt = "You are a data analyst inspecting clusters of questions asked by users. \
                     You want to create a holstic description of the cluster given it's samples. \n \
                     Summarize each of the following groups of samples into a single sentence or topic, no more than 10 words, \
                     that accurately summarizes the intent of the user in this platform. \n \
                     Return your result as a JSON object with the key being the provided Category number and \
                     the value being the summary description you create for that category \n \
                     For example, a single category should look like {1:'YOUR SUMARY OF SAMPLES IN CATEGORY ONE GOES HERE'} "

    user_prompt = ""
    for category in samples.keys():
        sample = samples[category]
        user_prompt += f"Category: {category}\n" + f"Samples: {sample}\n\n"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    return messages


# Builds prompt to generate sql query for sessions
def build_sessions_sql_prompt(user_query):
    system_prompt = 'You are a ClickHouse expert. Given an input question, create a syntactically \
                     correct SQL query which returns the rows specified by the question. \
                     There are two tables you have access to to query from: 1) {}.llm and 2) {}.product.\n \
                     Unless the user specifies in the question a specific number of examples to obtain, \
                     query for at most 50 results using the LIMIT clause as per SQLite. \n \
                     Pay attention to use only the column names you can see in the tables below. Be careful \
                     not to query for columns that do not exist. Also, pay attention to which column is in which table. \n \
                     Rows with the same session_id belong to the same session. When filtering for specific values, make sure you\n \
                     wrap the identifiers in single quotes. \n \
                     Create subqueries whenever possible, especially for UNIONs. For example: \n \
                     SELECT DISTINCT session_id FROM {}.llm \n \
                     UNION \n \
                     SELECT DISTINCT session_id FROM {}.product" \n \
                     LIMIT 50; \n \
                     Should be: \n \
                     SELECT * \n \
                     FROM ( \n \
                     SELECT session_id FROM {}.llm \n \
                     UNION DISTINCT \n \
                     SELECT session_id FROM {}.product \n \
                     ) \n \
                     LIMIT 50 \n \
                     Only output SQL code without backticks, and do not include the semicolon. \n\n'.format(db_name, db_name,
                                                                                                            db_name, db_name,
                                                                                                            db_name, db_name)

    tables = 'Only use the following tables: \n\n \
              CREATE TABLE {}.llm ( \n \
              "timestamp" DATETIME, \n \
              "event_name" STRING, \n \
              "user_id" UInt32, \n \
              "session_id" UInt32, \n \
              "data_source_id" UInt32, \n \
              "input_content" String, \n \
              "output_content" String, \n \
              "llm_in_use" Bool, \n \
              "input_token_count" UInt32, \n \
              "output_token_count" UInt32, \n \
              "cost" Float32, \n \
              "time_to_first_token" Float32, \n \
              "latency" Float32, \n \
              "error_status" String, \n \
              "chat_id" UInt32, \n\n \
              /* \n \
              */\n\n \
              CREATE TABLE {}.product ( \n \
              "timestamp" DATETIME, \n \
              "event_name" STRING, \n \
              "user_id" UInt32, \n \
              "session_id" UInt32, \n \
              "data_source_id" UInt32, \n\n \
              /* \n \
              3 rows from table "product" \n \
              timestamp event_name user_id session_id data_source_id \n \
              2022-06-16 16:00:00 "chat_send" 1 3 1 \n \
              2022-06-15 16:00:01 "share_dashboard" 2 4 1 \n \
              2022-02-16 16:00:02 "download_dashboard" 6 7 2 \n \
              */\n\n'.format(db_name, db_name)

    user_prompt = "Question: " + user_query + "\nSQLQuery: "

    messages = [
        {"role": "system", "content": system_prompt + tables},
        {"role": "user", "content": user_prompt},
    ]
    return messages

# Builds prompt to determine if LLM event belongs to category
def build_classify_event_prompt(category_description, event_name, input, output):
    system_prompt = "You will be provided with an event name, input content, and output content \
                     that corresponds to a specific user's interaction with my chat-based product. \n \
                     You will also be provided with a text description of a category that encompasses \
                     some set of user interactions. \n \
                     You want to determine if the provided interaction corresponds to the provided category. \n\n \
                     For example, here is a sample category and user interaction. \n \
                     Category: The output is a SQL query that generates data from the llm table. \n\n \
                     Event Name: SQL Generated \n \
                     Input Content:  \n \
                     Output Content: SELECT * FROM llm \n\n \
                     Classification: True \n\n \
                     Another example is as follows. \n \
                     Category: The user asks about their sales data \n\n \
                     Event Name: Classify response \n \
                     Input Content: What is the retention rate of the user? \n \
                     Output Content: Retention rate \n\n \
                     Classification: False"

    user_prompt = f"Category: {category_description}\n\nEvent Name: {event_name}\nInput Content: {input}\nOutput Content: {output}\n\nClassification:"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    return messages