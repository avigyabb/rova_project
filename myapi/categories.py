# User-defined categories
from .callgpt import *
from .consts import *

# Stores the user-defined categories
categories = [{"name": "NAME", "description": "DESCRIPTION"}]

# Define the categories dataframe, columns are sessions_id and category booleans
categories_df = pd.DataFrame()

# Add a new category
def add_category(name, description):
    categories.append({"name": name, "description": description})
    print("add")
    print(categories)
    
# Get all categories
def get_categories():
    return categories

# function to delete a category from the list
def delete_category(index):
    # when displaying categories index is reversed
    print("ran")
    print(categories)
    categories.pop(len(categories) - int(index) - 1)
    print(categories)

# TODO: figure out how to assign categories
def assign_category(row, category_description):
    event_id = row["event_id"]
    event_name = df["event_name"][event_id]
    input = df["input_content"][event_id]
    output = df["output_content"][event_id]

    response_obj = query_gpt(client, build_classify_event_prompt(category_description, event_name, input, output),
                             model="gpt-3.5-turbo", max_tokens=10)
    return response_obj == "True"

def create_categories_df():
    categories_df["event_id"] = df[df["event_type"] == 'llm'].index
    # categories_df[categories[0]["name"]] = categories_df.apply(assign_category, args=(categories[0]["description"],), axis=1)

create_categories_df()   
