from .consts import *
from langchain.prompts import PromptTemplate
from sklearn.metrics.pairwise import cosine_similarity
from .callgpt import *
import numpy as np

# traeces.py

def parse_session(group):
  prev_trace_id = -1
  template = ''
  for index, row in group.iterrows():
    if(row['event_type'] == 'llm' and prev_trace_id != row['trace_id']):
      prev_trace_id = row['trace_id']
      subgroup = group[group['trace_id'] == prev_trace_id]
      prompt = f"Event #{index}\n" + parse_trace(group)
    else:
      prompt = f"Event #{index}\n" + parse_session(row, index)
    template += prompt
  return template

def parse_session(group):
      prompt_template = PromptTemplate.from_template(
      "\n\n event_name: {event_name} was executed by user: {user_id} at timestamp: {timestamp} \n").format(event_name=group['event_name'], user_id=group['user_id'],
              timestamp=group['timestamp'])
      return prompt_template

def parse_trace(group):
    count = 0
    template = ""
    for index, row in group.iterrows():
      count += 1
      prompt_template = PromptTemplate.from_template(
      "\n\n step #: {step_number} \n event_name: {event_name} executed by user: {user_id} at timestamp: {timestamp} \n" + "input_content: {input_content}\n" +
      "output_content: {output_content}\n" + "error_status: {error_status}\n").format(step_number=count, event_name=row['event_name'], user_id = row['user_id'], \
      timestamp=row['timestamp'], input_content=row['input_content'], output_content=row['output_content'], error_status=row['error_status'])
      template += prompt_template
    return template

def embed_all_traces():

  # Group by 'trace_id' and apply the function to each group
  result_series = df.groupby('trace_id').apply(parse_trace)
  # Convert the result into a DataFrame
  traces_df = result_series.reset_index(name='trace_to_text')
  embeds = embeddings_model.embed_documents(traces_df['trace_to_text'])
  traces_df['embeds'] = [np.array(e) for e in embeds]

  return traces_df

def embed_all_sessions():

  # Now, you can group by 'session_id' and then 'group_id'
  result_series = df.groupby(['session_id']).apply(parse_session)
  sessions_df = result_series.reset_index(name='session_to_text')
  embeds = embeddings_model.embed_documents(sessions_df['session_to_text'])
  sessions_df['embeds'] = [np.array(e) for e in embeds]

  return sessions_df

def find_similar(trace_id, df, n=3):

    target_embedding = df.loc[df['trace_id'] == trace_id, 'embeds'].values[0]
    target_embedding = target_embedding.reshape(1, -1)
    similarities = cosine_similarity(target_embedding, list(df['embeds'])).flatten()
    
    similarity_series = pd.Series(similarities, index=df['trace_id'])
    similarity_series = similarity_series.drop(index=trace_id)
    most_similar = similarity_series.nlargest(n)
  
    # Convert the Series to a dictionary {trace_id: similarity}
    similar_dict = most_similar.to_dict()
    
    return similar_dict

