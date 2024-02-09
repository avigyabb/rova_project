# User-defined categories
from .callgpt import *

categories = [{"name": "NAME", "description": "DESCRIPTION"}]

# Add a new category
def add_category(name, description):
    categories.append({"name": name, "description": description})

# Get all categories
def get_categories():
    return categories

def assign_category(gptclient, category_description, event_name, input, output):
    response_obj = query_gpt(gptclient, build_classify_event_prompt(category_description, event_name, input, output))
    return response_obj == "True"
