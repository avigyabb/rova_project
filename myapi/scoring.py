
from .consts import *
from .traces import *
from .callgpt import *
from .utils import *

from keymetrics.models import SessionsToScores,  ListOfKPIs, SessionsToKPIs
from collections import defaultdict
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.impute import KNNImputer
from pgmpy.models import BayesianNetwork
from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination
import hdbscan

# Dictionary that maps importance texts to score
importance_score_dict = {
    "Very Negative": 1,
    "Negative": 2,
    "Neutral": 3,
    "Positive": 4,
    "Very Positive": 5
}

def tree():
    return defaultdict(tree)

# Returns a list of session ID, score pairs sorted by score in ascending order
@time_function
def score_sessions_based_on_kpis(user, n):

    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)
    # Find all unique session IDs
    unique_session_ids = UserSessionsToKPIs.values_list('session_id', flat=True).distinct()

    # Create a dictionary mapping all sessions ids to 0 initial score
    session_score_dict = {session_id: 0 for session_id in unique_session_ids}
    session_freq_dict = {session_id: 0 for session_id in unique_session_ids}
    session_score_name = defaultdict(set)

    # Loop over all KeyMetric instances
    session_metrics_query = UserSessionsToKPIs.all()
    for session_metric in session_metrics_query:
        session_freq_dict[session_metric.session_id] += 1
        # Grab the associated KeyMetric
        key_metric = UserListOfKPIs.get(id=session_metric.keymetric_id)
        # Add to the score
        session_score_dict[session_metric.session_id] += importance_score_dict[key_metric.importance]
        session_score_name[session_metric.session_id].add(key_metric.name)

    for session_id in session_freq_dict:
        avg_score = session_score_dict[session_id] / session_freq_dict[session_id]
        session_score_dict[session_id] = avg_score

        # update instance
        instance, created = SessionsToScores.objects.get_or_create(user=user, session_id=session_id)
        instance.kpi_score = int(avg_score)
        instance.save()

    # Create a list of session ID, score pairs sorted by score in ascending order
    # Only contains sessions that have a KPI included
        
    sessions_df, max_indx = aggregate_score(user, DataframeLoader.get_dataframe('df'), 0.1)
    result = bayes_scoring(sessions_df, max_indx)
    session_score_dict = {k: v*20 for k, v in sorted(result.items(), key=lambda item: item[1])}
    worst_ids = list(session_score_dict.keys())[0:n]

    return worst_ids, session_score_dict, session_score_name

# score using bayesian network
@time_function
def aggregate_score(user, df, coverage=0.0):
    sessions_df = DataframeLoader.get_dataframe('sessions_df')

    # Assuming these columns are initialized as per your existing structure
    sessions_df['kpi_score'] = np.nan
    sessions_df['justification'] = np.nan
    sessions_df['ai_score'] = np.nan
    sessions_df['user_score'] = np.nan

    # Your existing logic for selecting indices and updating 'ai_scores' and 'justification'
    selected_indices = np.random.choice(sessions_df.index, size=int(len(sessions_df) * coverage), replace=False)
    for idx in selected_indices:
        result = explain_session(df, user_prompt_provided=sessions_df.loc[idx, 'session_to_text'])
        sessions_df.loc[idx, 'ai_score'] = int(result['score'])  # Assuming this should be 'ai_score', not 'ai_scores'
        sessions_df.loc[idx, 'justification'] = result['justification']
        session_obj, created = SessionsToScores.objects.get_or_create(user=user, session_id=idx)
        session_obj.ai_score = int(result['score'])
        session_obj.save()

    max_indx = 0
    # New step: Update DataFrame based on Django model
    # Iterate through each row in the DataFrame to update scores from the Django model
    for idx, row in sessions_df.iterrows():
        # Query the Django model for the current session_id
        session_scores, created = SessionsToScores.objects.get_or_create(user=user, session_id=row['session_id'])
        session_scores.save()
        custom_scores = []
        if(not created):
            if(session_scores.custom_score is not None):
                custom_scores = [int(s.strip()) for s in session_scores.custom_score.split('_') if s != '']
            # Update the DataFrame with values from the Django model if they are not None
            sessions_df.at[idx, 'kpi_score'] = session_scores.kpi_score
            sessions_df.at[idx, 'user_score'] = session_scores.user_score if session_scores.user_score else random.choice([session_scores.kpi_score, session_scores.ai_score])
            sessions_df.at[idx, 'ai_score'] = session_scores.ai_score
            for indx, c in enumerate(custom_scores):
                if(indx > max_indx):
                    max_indx = indx
                sessions_df.at[idx, 'custom_score_'+str(indx+1)] = custom_scores[indx] if custom_scores[indx] is not None else np.nan
        # Reshape data for k-means
    embeddings = np.array(sessions_df['embeds'].tolist())

    # Apply k-means to find clusters, assume 10% distinct clusters
    # kmeans = KMeans(n_clusters=10, random_state=0).fit(embeddings)
    # # Assign cluster labels to DataFrame
    # sessions_df['cluster_label'] = kmeans.labels_
    clusterer = hdbscan.HDBSCAN(min_cluster_size=3, gen_min_span_tree=True)
    cluster_labels = clusterer.fit_predict(embeddings)

    sessions_df['cluster_label'] = cluster_labels
    
    # Assuming you want to return the updated DataFrame
    return sessions_df, max_indx

# Returns a list of session ID, score pairs sorted by score in ascending order
@time_function
def score_and_return_sessions(user):

    worst_ids, scores_map, _ = score_sessions_based_on_kpis(user, n=5)

    UserListOfKPIs = ListOfKPIs.objects.filter(user=user)
    UserSessionsToKPIs = SessionsToKPIs.objects.filter(user=user)

    worst_sessions = UserSessionsToKPIs.filter(session_id__in=worst_ids)
    session_score_dict = defaultdict(tree)
    df = DataframeLoader.get_dataframe('df')
    for session_metric in worst_sessions:

        # Grab the associated KeyMetric
        key_metric = UserListOfKPIs.get(id=session_metric.keymetric_id)
        # Add to the score
        if(session_metric.session_id not in session_score_dict):
            filtered = df[df['session_id'] == session_metric.session_id]
            session_score_dict[session_metric.session_id]['summary'] = explain_session(filtered, flag=1)
            session_score_dict[session_metric.session_id]['user_id'] = filtered.iloc[0]['user_id']
            session_score_dict[session_metric.session_id]['timestamp'] = filtered.iloc[0]['timestamp']
            session_score_dict[session_metric.session_id]['score'] = scores_map[session_metric.session_id]
            session_score_dict[session_metric.session_id]['tags'] = []
        session_score_dict[session_metric.session_id]['tags'].append(key_metric.name)

    # Create a list of session ID, score pairs sorted by score in ascending order
    
    return session_score_dict

def impute(df, max_indx):
  # Perform KNN imputation
  columns_to_select = ['session_id', 'user_score', 'ai_score', 'kpi_score', 'cluster_label']
  for i in range(max_indx):
      columns_to_select += ['custom_score_'+str(i+1)]
  df_subset = df[columns_to_select].to_numpy()
  imputer = KNNImputer(n_neighbors=5, keep_empty_features=True)  # Adjust n_neighbors as needed
  imputed_data = imputer.fit_transform(df_subset)  # Ensure numerical data only
  df_imputed = pd.DataFrame(imputed_data, columns=columns_to_select)
  return df_imputed

# Generates Bayesian Network for scoring
@time_function
def bayes_scoring(sessions_df, max_indx):
    # Define the structure of your Bayesian Network
    sessions_df = impute(sessions_df, max_indx)
    print(sessions_df)
    model_structure = [
        ('user_score', 'ai_score'),
        ('user_score', 'cluster_label'),
        ('user_score', 'kpi_score'),
        ('ai_score', 'cluster_label'),
        ('ai_score', 'kpi_score'),
        # Add more dependencies as per your understanding of the domain
    ]
    for i in range(max_indx):
        model_structure.append(('custom_score_'+str(i+1), 'cluster_label'))
        model_structure.append(('user_score', 'custom_score_'+str(i+1)))
    # Initialize and fit the model
    model = BayesianNetwork(model_structure)
    model.fit(sessions_df, estimator=BayesianEstimator, prior_type="BDeu")  # BDeu can be replaced as needed
    
    # Initialize the inference object
    infer = VariableElimination(model)

    # Placeholder for results
    results = {}
    # Iterate over each row in the DataFrame
    for index, row in sessions_df.iterrows():
        id = row['session_id']
        # Construct evidence dictionary dynamically based on non-NaN values in the row
        evidence = {}
        cols = ['kpi_score', 'ai_score', 'cluster_label'] + ['custom_score_'+str(i+1) for i in range(max_indx)]
        for col in cols:
            if pd.notna(row[col]):
                evidence[col] = row[col]

        # Perform the query only if evidence is not empty
        if evidence:
            query_result = infer.query(variables=['user_score'], evidence=evidence)
            state_names = query_result.state_names['user_score']
            max_prob_index = np.argmax(query_result.values)
            highest_prob_state = state_names[max_prob_index]
            results[id] = highest_prob_state
        else:
            # Handle case with no evidence
            results[id] = 3
    # Return the results list with the highest probability state for each row
    return results
