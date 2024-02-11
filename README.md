Start the Django development server (from the root dir):
python manage.py runserver

React stuff (from frontend):
npm install
npm start

When pushing to prod:
pip freeze > requirements.txt
git push main

Things to convert to models
traces_df
categories

Starting a django app
python manage.py startapp [app name]

Make changes to django database/urls in another app: everytime you make a change to a model
python manage.py makemigrations - save the changes
python manage.py migrate - apply the changes
