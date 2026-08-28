from flask import Flask, render_template, request
from bs4 import BeautifulSoup
import requests
import json

def scrape_podcast_app_home():
  url = "https://podcast.app/"
  headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
  response = requests.get(url, headers=headers)

  print(f"DEBUG: Status Code for Home Page: {response.status_code}")

  if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    script_tag = soup.find('script', id='__NEXT_DATA__')

    podcasts = []
    if script_tag:
      try:
        json_data = json.loads(script_tag.string)
        # DEBUG: Print a part of the JSON data to verify extraction
        # print(f"DEBUG: JSON Data keys: {json_data.keys()}")

        page_props = json_data.get('props', {}).get('pageProps', {})
        # print(f"DEBUG: pageProps keys: {page_props.keys()}")

        promoted_shows = page_props.get('promotedShows', [])
        # print(f"DEBUG: Found {len(promoted_shows)} promoted shows.")

        for show in promoted_shows:
          title = show.get('alt', 'N/A')
          link_suffix = show.get('url', 'N/A')
          link = url + link_suffix if link_suffix.startswith('/') else link_suffix
          description = 'N/A' # Description is not directly available in 'promotedShows'

          podcasts.append({
              'title': title,
              'description': description,
              'link': link
          })
      except json.JSONDecodeError as e:
        print(f"Error decoding JSON from __NEXT_DATA__: {e}")
        print("Printing script tag content for inspection:")
        print(script_tag.string)
      except Exception as e:
        print(f"An unexpected error occurred during JSON processing: {e}")
        print(f"Promoted shows type: {type(promoted_shows)}")
    else:
        print("No __NEXT_DATA__ script tag found. Printing raw HTML for inspection:")
        print(soup.prettify())

    return podcasts
  else:
    print(f"Failed to retrieve homepage. Status code: {response.status_code}")
    return None

#######
home_podcasts = scrape_podcast_app_home()
if home_podcasts:
    for p in home_podcasts:
        print(f"Title: {p['title']}\nDescription: {p['description']}\nLink: {p['link']}\n---")
else:
    print("Could not retrieve podcasts from the homepage.")

#######

def search_podcast_app(query):
  search_url = f"https://podcast.app/search?q={query}"
  headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
  response = requests.get(search_url, headers=headers)

  print(f"DEBUG: Status Code for Search '{query}': {response.status_code}")

  if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    script_tag = soup.find('script', id='__NEXT_DATA__')

    titles = []
    if script_tag:
      try:
        json_data = json.loads(script_tag.string)
        page_props = json_data.get('props', {}).get('pageProps', {})

        # DEBUG: Print the entire pageProps for inspection
        print(f"DEBUG: pageProps for search '{query}': {page_props.keys()}")
        # To avoid printing a very large output, we'll selectively print part of pageProps
        # If 'searchResult' or similar key exists, we'll print its contents.
        print(f"DEBUG: Full pageProps for search '{query}': {json.dumps(page_props, indent=2)}")

        # Assuming 'searchResult' might still be the key, but we'll verify from the output
        search_result = page_props.get('searchResult', {})
        shows = search_result.get('shows', [])

        for show in shows:
          title = show.get('name', show.get('title', 'N/A'))
          titles.append(title)
      except json.JSONDecodeError as e:
        print(f"Error decoding JSON from __NEXT_DATA__: {e}")
        print("Printing script tag content for inspection:")
        print(script_tag.string)
      except Exception as e:
        print(f"An unexpected error occurred during JSON processing: {e}")
        print(f"pageProps type: {type(page_props)}")

    else:
        print(f"No __NEXT_DATA__ script tag found for search '{query}'. Printing raw HTML for inspection:")
        print(soup.prettify())

    return list(set(titles))
  else:
    print(f"Failed to retrieve search results for '{query}'. Status code: {response.status_code}")
    return None

#######

# search_results_france = search_podcast_app('france')
# if search_results_france:
#     print("Podcasts found for 'france':")
#     for title in search_results_france:
#         print(f"- {title}")
# else:
#     print("Could not retrieve search results for 'france'.")
