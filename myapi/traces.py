from .consts import *
from .utils import *
from langchain.prompts import PromptTemplate
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
if umap_flag:
    import umap.umap_ as umap
    
# traeces.py

def parse_product(group):
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

def parse_session(group):
  prev_trace_id = -1;
  template = ''
  for index, row in group.iterrows():
    if(row['event_type'] == 'llm' and prev_trace_id != row['trace_id']):
      prev_trace_id = row['trace_id']
      subgroup = group[group['trace_id'] == prev_trace_id]
      prompt = f"Event #{index}\n" + parse_trace(subgroup)
    else:
      prompt = f"Event #{index}\n" + parse_product(row)
    template += prompt
  return template

def embed_all_traces(df, embeddings_model, traces_df=None, new_trace=None):


  # Group by 'trace_id' and apply the function to each group
  if len(df) == 0:
    return []
  
  if(new_trace is not None):
             # Assume new_trace is a dictionary with keys 'trace_id' and 'trace_to_text'
        filtered = df[df['trace_id'] == new_trace]
        new_trace_dict = {'trace_id': new_trace, 'trace_to_text': parse_trace(filtered)}
        new_trace_df = pd.DataFrame([new_trace])
        
        # Compute embeddings for the new trace
        embeds = embeddings_model.embed_documents(new_trace_df['trace_to_text'])
        new_trace_df['embeds'] = [np.array(e) for e in embeds]
        
        # Append the new row to the existing DataFrame
        # Ensure the original DataFrame has the same structure
        if 'embeds' not in traces_df.columns:
            traces_df['embeds'] = np.nan  # Initialize the column if it doesn't exist
            traces_df = traces_df.astype({'embeds': 'object'})  # Ensure the 'embeds' column is of type object
        
        # Append new_trace_df to df
        traces_df = pd.concat([traces_df, new_trace_df], ignore_index=True)
  else:
    # Group by 'trace_id' and apply the function to each group
    result_series = df.groupby('trace_id').apply(parse_trace)
    traces_df = result_series.reset_index(name='trace_to_text')
    embeds = embeddings_model.embed_documents(traces_df['trace_to_text'])
    traces_df['embeds'] = [np.array(e) for e in embeds]

  return traces_df

@time_function
def embed_all_sessions(df, embeddings_model):

    result_series = df.groupby(['session_id']).apply(parse_session)
    sessions_df = result_series.reset_index(name='session_to_text')

    embeds = embeddings_model.embed_documents(sessions_df['session_to_text'])
    
    if umap_flag:
      embeds_array = np.vstack(embeds)
      reducer = umap.UMAP(n_components=10, random_state=42)
      umap_embeddings = reducer.fit_transform(embeds_array)

      sessions_df['embeds'] = list(umap_embeddings)
    else:
      sessions_df['embeds'] = [e for e in embeds]

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

