# Asks ChatGPT to identify topics
import json
from .consts import *
from .traces import *
from .utils import *
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

# Prompt to generate topics + descriptions
# def prompt_to_generate_topics(questions):
#     system_prompt = "You are a product analyst observing trends in user questions to a chatbot. Observe the following list of questions and produce a \
#                         a category_name for the questions that identifies the topic of the user's question in 3 words or less and 2) a description of this category. \
#                         Your output should be a JSON formatted object of the form \
#                         {'name': 'category_name', 'description': 'category_description'}."

#     msg = [{"role": "system", "content": system_prompt}, {"role": "user", "content": "\n ".join(questions)}]                    
#     return msg

# Prompt to determine if a question belongs to a topic
def prompt_question_to_topic(topic, question):
    system_prompt = "You will be given a topic that describes a set of questions and your job is to determine if a question belongs to that topic. \
                     Your classification should be either Yes or No."
    user_prompt = "Topic: " + topic + "\nQuestion: " + question + "Classification: "
    msg = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]                    
    return msg

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

# TODO: write description
def explain_trace(df, trace_id):
  
  filtered = df[df['trace_id'] == int(trace_id)]

  user_prompt_raw = parse_trace(filtered)
  user_prompt = {'role':'user', 'content':user_prompt_raw}
  system_prompt = {'role': 'system', 'content':"You are a product analyst observing logs of user interactions with a LLM-based app.Analyze the following function-call trace triggered by a user's interaction with an LLM-based app. \
                   Provide a summary of the entire interaction, summarizing all steps. Then highlight specific point of interest, for example if the content of the otuput does not answer the user's question or command"}

  new_prompt = [system_prompt, user_prompt]
  
  return new_prompt 

# TODO: write description
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

def prompt_to_generate_clusters(sentence, flag=0, custom_eval=None):
    if(flag == 1):
        system_prompt = "You are a product analyst observing trends in user behaviors. Observe the following description of a session and produce a 1 sentence summary of \
                        the session discussing interesting user behaviors, errors, or question/output pairs that should be surfaced to a product analyst."
    elif(flag == 0):
        system_prompt = "You are a product analyst observing trends in user questions to a chatbot. Observe the following list of questions and produce a \
                        a category_name for the questions that identifies the topic of the user's question in 3 words or less and 2) a description of this category. \
                        Your output should be a JSON formatted object of the form \
                        {'name': 'category_name', 'description': 'category_description'}."
    elif(flag == 2):
        system_prompt = "You are a product analyst observing a single session of a user using your product. Observe the following description of a session and score the \
                          interaction overall by grading whether the user accomplished their task. Consider how many quetsions the user needed to ask before accomplishing their task \
                          as well as their overall sentiment, frusturation, satisfaction, and delight during the interaction. Provide your score on from the set {1, 2, 3, 4, 5} with 1 \
                          being very negative and 5 being very positive and then justify your response in a single sentence. Your output should be a JSON object of the form {'score': 'score', 'justification': 'justification'}."
    elif(flag == 3 and custom_eval):
        description = custom_eval['description']
        importance = custom_eval['importance']
        system_prompt = "A product analyst has asked you to observe a single session of a user using your product. The product analyst has provided you with a natural language \
                          description of a evaluation they want to make on that session as well as how important that evaluation is to them. The description is: " + description + ", and the importance of this eval (from Very Negative to Very Positive) is " + importance + ".  \
                          Determine if the provided description characterizes the session below. If so output the given score from the user from the set {1, 2, 3, 4, 5} with 1 being very negative and 5 being very positive and then justify your response in a single sentence. \
                          Your output should be a JSON object of the form '{'score': 'score', 'justification': 'justification'}'. If the evaluation does not seem relevant to the provided session, return 'N/A' for the score and justification."
    msgs = [{"role": "system", "content": system_prompt}, {"role": "user", "content": "Here is a description of a session: {}".format(sentence)}]
    return msgs

@time_function
def explain_session(filtered, flag=2, user_prompt_provided=None, custom_eval=None):
    json_flag = False if flag==1 else True
    if(user_prompt_provided is None):
      user_prompt_raw = parse_session(filtered)
    else:
      user_prompt_raw = user_prompt_provided
    msgs = prompt_to_generate_clusters(user_prompt_raw, flag, custom_eval=custom_eval)
    summary = query_gpt(client, msgs, json_output=json_flag)
    return summary


