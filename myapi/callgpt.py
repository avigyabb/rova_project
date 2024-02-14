# Asks ChatGPT to identify topics
import json
from .consts import *
from .traces import *
import random

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
                     Only output SQL code without backticks, and do not include the semicolon. \n\n'.format(
        db_name, db_name, db_name, db_name, db_name, db_name
    )

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
              */\n\n'.format(
        db_name, db_name
    )

    user_prompt = "Question: " + user_query + "\nSQLQuery: "

    messages = [
        {"role": "system", "content": system_prompt + tables},
        {"role": "user", "content": user_prompt},
    ]
    return messages


def explain_trace(df, trace_id):
  
  filtered = df[df['trace_id'] == int(trace_id)]

  user_prompt_raw = parse_trace(filtered)
  user_prompt = {'role':'user', 'content':user_prompt_raw}
  system_prompt = {'role': 'system', 'content':"You are a product analyst observing logs of user interactions with a LLM-based app.Analyze the following function-call trace triggered by a user's interaction with an LLM-based app. \
                   Provide a summary of the entire interaction, summarizing all steps. Then highlight specific point of interest, for example if the content of the otuput does not answer the user's question or command"}

  new_prompt = [system_prompt, user_prompt]
  
  return new_prompt 


def explain_session_by_kpis(df, keymetrics, kpi, k=5):
    matches = [d for d in keymetrics if d.get("name") == kpi]
    if len(matches) > 0:
        matches = matches[0]
    else:
        return False
    samp_amt = min(len(matches['session_ids']), k)
    session_ids = random.sample(matches['session_ids'], samp_amt)
    user_prompt = ""
    for indx, id in enumerate(session_ids):  # for each session_ids:
        filtered = df[df["session_id"] == int(id)].sort_values(by="timestamp")
        user_prompt_raw = parse_session(filtered)
        user_prompt += "Sample #{}: \n".format(indx + 1) + user_prompt_raw + "\n"
    user_prompt = {"role": "user", "content": user_prompt}
    system_prompt = {
        "role": "system",
        "content": "You are a product analyst observing logs of user interactions with a LLM-based app. Analyze the following sample sessions from a category of all sessions which follow \
                                                this sequence of steps: {} \n then provide 1 sentence analysis of the similarities in types of questions users are asking who follow this behavior/sequence of steps".format(
            kpi
        ),
    }
    new_prompt = [system_prompt, user_prompt]
    return new_prompt


def prompt_to_generate_clusters(sentence, flag=0):
    if(flag):
        system_prompt = "You are a product analyst observing trends in user behaviors. Observe the following description of a session and produce a 1 sentence summary of \
                        the session discussing interesting user behaviors, errors, or question/output pairs that should be surfaced to a product analyst."
    else:
        system_prompt = "You are a product analyst observing trends in user behaviors. Observe the following description of a session and identify 1) \
                        a category_name for sessions that specifically identifies the topic of the user's question and 2) a description of this category. Your output should be a JSON formatted object of the form \
                        {'name': 'category_name', 'description': 'category_description'}."
    msgs = [{"role": "system", "content": system_prompt}, {"role": "user", "content": "Here is a description of a session: {}".format(sentence)}]
    return msgs

def explain_session(filtered):
    user_prompt_raw = parse_session(filtered)
    msgs = prompt_to_generate_clusters(user_prompt_raw, 1)
    summary = query_gpt(client, msgs, json_output=False)
    return summary


