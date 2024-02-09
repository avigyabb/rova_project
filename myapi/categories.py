categories = [{"name": "NAME", "description": "DESCRIPTION"}]

# Add a new category
def add_category(name, description):
    categories.append({"name": name, "description": description})

# Get all categories
def get_categories():
    return categories