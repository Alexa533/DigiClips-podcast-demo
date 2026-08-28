# Alexa Hernandez, python backend for Podcast searching with Podcast App site
from flask import Flask, render_template, request
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)

#GET and POST methods for the search page
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        #get data from HTML input
        query = request.form.get('search_query')
        # Here,  typically call a function to perform the search
        # For demonstration, we'll just return the search query
        # return f"<h1>Search: {query}! Python received your input.</h1>"
        # print(f"<h1>Search: {query}! Python received your input.</h1>")
        ### return podcast_app_search('demo.html', query=search_query)

    #if GET request, just show HTML form
    return render_template('demo.html')

if __name__ == '__main__':
    app.run(debug=True)

def podcast_app_search(query):
    # This function would contain the logic to search for podcasts based on the search_query
    # For now, it will just return a placeholder response
    return f"Searching for podcasts related to: {query}"
