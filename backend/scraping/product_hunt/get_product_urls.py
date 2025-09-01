import requests
import json
import os # <-- ADD THIS IMPORT
from dotenv import load_dotenv # <-- ADD THIS IMPORT

# --- NEW: Load environment variables from .env file ---
# This looks for a .env file in the directory this script is run from's parent
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Load the API token from the environment variable
API_TOKEN = os.getenv("PRODUCT_HUNT_API_TOKEN")

if not API_TOKEN:
    print("Error: PRODUCT_HUNT_API_TOKEN not found in .env file.")
else:
    headers = {
        'Authorization': f'Bearer {API_TOKEN}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    query = """
    query getAiPosts($cursor: String) {
      posts(first: 50, after: $cursor, topic: "artificial-intelligence") {
        edges {
          node {
            slug
            url
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
    """

    all_product_urls = []
    cursor = None
    page_count = 0
    MAX_PAGES = 10 

    print("Fetching product URLs from Product Hunt API...")

    while page_count < MAX_PAGES:
        variables = {"cursor": cursor}
        
        try:
            response = requests.post(
                "https://api.producthunt.com/v2/api/graphql",
                headers=headers,
                json={'query': query, 'variables': variables}
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'errors' in data:
                print(f"API Error: {data['errors']}")
                break
            
            posts_data = data['data']['posts']
            edges = posts_data['edges']
            
            for edge in edges:
                product_url = edge['node']['url']
                all_product_urls.append(product_url)
            
            page_info = posts_data['pageInfo']
            if page_info['hasNextPage']:
                cursor = page_info['endCursor']
                page_count += 1
                print(f"  -> Page {page_count} fetched successfully. Total URLs: {len(all_product_urls)}")
            else:
                print("No more pages to fetch.")
                break
                
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            break

    if all_product_urls:
        with open("product_hunt_urls.txt", "w") as f:
            for url in all_product_urls:
                f.write(f"{url}\n")
        print(f"\nSuccess! Saved {len(all_product_urls)} URLs to product_hunt_urls.txt")
