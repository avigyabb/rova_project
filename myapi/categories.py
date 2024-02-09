# User-defined categories
from .callgpt import *

categories = [{"name": "NAME", "description": "DESCRIPTION"}]


# Add a new category
def add_category(name, description):
    categories.append({"name": name, "description": description})
    print("add")
    print(categories)


# Get all categories
def get_categories():
    return categories


def assign_category(gptclient, category_description, event_name, input, output):
    response_obj = query_gpt(
        gptclient,
        build_classify_event_prompt(category_description, event_name, input, output),
    )
    return response_obj == "True"


# function to delete a category from the list
def delete_category(index):
    # when displaying categories index is reversed
    print("ran")
    print(categories)
    categories.pop(len(categories) - int(index) - 1)
    print(categories)
