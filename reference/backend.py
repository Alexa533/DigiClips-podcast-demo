# Alexa Hernandez, python backend for Podcast searching with Podcast App site

# http://127.0.0.1:5000/ when running the Flask app
from flask import Flask, render_template, request

app = Flask(__name__)

# COMMENTING OUT SINCE WE ARE USING A SINGLE PAGE APP WITH JAVASCRIPT TO HANDLE SEARCH QUERIES NOW
# @app.route('/', methods=['GET', 'POST'])
# def index():
#     query = None

#     if request.method == 'POST':
#         query = request.form.get('search_query')
#         if not query:
#             query = ''

#     return render_template('demo.html', query=query)


@app.route('/search')
def search_results():
    query = request.args.get('q', '')
    return f"Searching for podcasts related to: {query}"


if __name__ == '__main__':
    app.run(debug=True)


def podcast_app_search(query):
    # This function would contain the logic to search for podcasts based on the search_query
    # For now, it will just return a placeholder response
    return f"Searching for podcasts related to: {query}"
