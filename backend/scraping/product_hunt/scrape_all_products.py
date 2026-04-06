# # (The imports and helper functions at the top remain the same)
# import time
# import re
# import random
# from datetime import datetime
# import json
# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service as ChromeService
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.common.exceptions import TimeoutException, NoSuchElementException

# def generate_tool_id(name):
#     if not name: return None
#     s = name.lower().strip()
#     s = re.sub(r'[\s\.]+', '-', s)
#     s = re.sub(r'[^\w\-]', '', s)
#     return s

# def main():
#     try:
#         with open("product_hunt_urls.txt", "r") as f:
#             urls_to_scrape = [line.strip() for line in f.readlines()]
#     except FileNotFoundError:
#         print("Error: product_hunt_urls.txt not found.")
#         return

#     options = webdriver.ChromeOptions(); options.add_argument("--headless"); # Simplified for brevity
#     driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
#     print("WebDriver initialized.")
    
#     all_tools_data = []
#     total_urls = len(urls_to_scrape)
#     print(f"Starting to scrape {total_urls} Product Hunt pages...")

#     for index, url in enumerate(urls_to_scrape):
#         print(f"Scraping ({index + 1}/{total_urls}): {url}")
        
#         tool_data = {}
#         try:
#             driver.get(url)
#             WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
#             time.sleep(2)
            
#             # --- (Existing data extraction is the same) ---
#             try:
#                 name = driver.find_element(By.TAG_NAME, 'h1').text
#                 tool_data['name'] = name; tool_data['id'] = generate_tool_id(name)
#             except NoSuchElementException: tool_data['name'] = "Name not found"

#             if tool_data.get('name') == "Name not found": continue

#             try: tool_data['description'] = driver.find_element(By.TAG_NAME, 'h2').text
#             except NoSuchElementException: tool_data['description'] = None
            
#             # --- NEW: EXTRACT REVIEW COUNT ---
#             try:
#                 # Find the link/button that leads to reviews/comments
#                 reviews_link = driver.find_element(By.XPATH, "//a[contains(., 'reviews')] | //button[contains(., 'reviews')] | //a[contains(., 'comments')] | //button[contains(., 'comments')]")
#                 # Extract the number from the text
#                 review_text = reviews_link.text
#                 numbers = re.findall(r'\d+', review_text)
#                 if numbers:
#                     tool_data['reviewCount'] = int(numbers[0])
#                 else:
#                     tool_data['reviewCount'] = None
#             except NoSuchElementException:
#                 tool_data['reviewCount'] = None

#             # We don't have a reliable star rating from Product Hunt
#             tool_data['rating'] = None 
            
#             # (The rest of the extraction logic is the same)
#             try:
#                 upvote_text = driver.find_element(By.CSS_SELECTOR, "div[class*='styles_bigButtonCount']").text
#                 tool_data['popularity'] = int(upvote_text.replace(',', ''))
#             except (NoSuchElementException, ValueError): tool_data['popularity'] = None
#             try:
#                 topic_elements = driver.find_elements(By.XPATH, "//a[contains(@href, '/topics/')]")
#                 tool_data['categories'] = [elem.text for elem in topic_elements if elem.text]
#             except NoSuchElementException: tool_data['categories'] = []
#             try:
#                 link_element = driver.find_element(By.CSS_SELECTOR, "a[data-test='product-header-visit-button']")
#                 tool_data['website'] = link_element.get_attribute('href')
#             except NoSuchElementException: tool_data['website'] = None

#             tool_data['pricingModel'] = "Check Website"; tool_data['github'] = None; tool_data['docs'] = None; tool_data['keyFeatures'] = []; tool_data['useCases'] = []; tool_data['pros'] = []; tool_data['cons'] = []; tool_data['model'] = None; tool_data['integrations'] = []; tool_data['alternatives'] = []; tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d"); tool_data['trendScore'] = random.randint(70, 95)
            
#             all_tools_data.append(tool_data)
            
#         except (TimeoutException, Exception) as e:
#             print(f"  -> An error occurred for {url}: {e}. Skipping.")
#             continue

#     driver.quit()
#     print("\nWebDriver closed.")

#     if all_tools_data:
#         json_filename = "product_hunt_data.json"
#         with open(json_filename, "w") as f:
#             json.dump(all_tools_data, f, indent=2)
#         print(f"✅ All data successfully saved to {json_filename}")

# if __name__ == "__main__":
#     main()


import requests
import json
import os
import re
import random
from datetime import datetime
from dotenv import load_dotenv

# Load credentials
load_dotenv()
API_TOKEN = os.getenv("PRODUCT_HUNT_API_TOKEN")
STATE_FILE = "product_hunt_scrape_state.json"
OUTPUT_FILE = "product_hunt_data.json"


def load_state():
    default_state = {"processed_ids": [], "last_run": None}
    if not os.path.exists(STATE_FILE):
        return default_state
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        processed_ids = data.get("processed_ids", [])
        if not isinstance(processed_ids, list):
            processed_ids = []
        return {
            "processed_ids": processed_ids,
            "last_run": data.get("last_run")
        }
    except (OSError, json.JSONDecodeError):
        return default_state


def save_state(processed_ids):
    state = {
        "processed_ids": sorted(processed_ids),
        "last_run": datetime.now().strftime("%Y-%m-%d")
    }
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def generate_tool_id(name):
    if not name: return None
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

def fetch_product_hunt_tools(limit=40, seen_ids=None):
    """
    Uses GraphQL to fetch AI tools in bulk. 
    Much faster and more reliable than Selenium.
    """
    if not API_TOKEN:
        print("❌ Error: PRODUCT_HUNT_API_TOKEN not found in environment.")
        return []

    seen_ids = seen_ids or set()

    url = "https://api.producthunt.com/v2/api/graphql"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    }

    # This query fetches exactly what we need for our frontend
    # query = """
    # query getAiTools($limit: Int) {
    #   posts(first: $limit, topic: "artificial-intelligence", order: NEWEST) {
    #     edges {
    #       node {
    #         name
    #         tagline
    #         description
    #         url
    #         votesCount
    #         reviewsCount
    #         reviewsRating
    #         website
    #         topics {
    #             edges {
    #                 node {
    #                     name
    #                 }
    #             }
    #         }
    #         thumbnail {
    #           url
    #         }
    #         createdAt
    #       }
    #     }
    #   }
    # }
    # """

    query = """
    query getAiTools($limit: Int) {
        posts(first: $limit, topic: "artificial-intelligence", order: NEWEST) {
            edges {
                node {
                    name
                    tagline
                    description
                    url
                    votesCount
                    reviewsCount
                    reviewsRating
                    website
                    topics {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                    thumbnail {
                        url
                    }
                    createdAt
                }
            }
        }
    }
    """
    
    variables = {"limit": limit}

    try:
        print(f"Requesting {limit} tools from Product Hunt API...")
        response = requests.post(url, json={'query': query, 'variables': variables}, headers=headers)
        response.raise_for_status()
        data = response.json()

        if 'errors' in data:
            print(f"❌ API Error: {data['errors']}")
            return []

        posts = data['data']['posts']['edges']
        processed_tools = []

        for edge in posts:
            node = edge['node']
            name = node.get('name')
            tool_id = generate_tool_id(name)

            # The feed is ordered by NEWEST, so once we hit a known ID,
            # the remainder should already be stored.
            if tool_id and tool_id in seen_ids:
                print(f"Reached known Product Hunt item '{tool_id}'. Stopping incremental fetch.")
                break
            
            # Map API response to our project's Tool schema
            tool_data = {
                "id": tool_id,
                "name": name,
                "description": node.get('description') or node.get('tagline'),
                "website": node.get('website') or node.get('url'),
                "popularity": node.get('votesCount', 0),
                "reviewCount": node.get('reviewsCount', 0),
                "rating": node.get('reviewsRating'),
                "categories": [
                    t['node']['name']
                    for t in node.get('topics', {}).get('edges', [])
                        if t.get('node') and t['node'].get('name')
                ],
                "github": None,
                "docs": None,
                "logoUrl": node.get('thumbnail', {}).get('url'),
                "releaseDate": node.get('createdAt', '').split('T')[0],
                "pricingModel": "Check Website",
                "trendScore": random.randint(80, 98),
                "keyFeatures": [],
                "useCases": [],
                "pros": [],
                "cons": []
            }
            if tool_id:
                processed_tools.append(tool_data)

        print(f"✅ Successfully processed {len(processed_tools)} tools.")
        return processed_tools

    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return []

def main():
    state = load_state()
    seen_ids = set(state.get("processed_ids", []))
    tools = fetch_product_hunt_tools(limit=40, seen_ids=seen_ids)  # Increase limit if needed

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(tools, f, indent=2)

    new_ids = {tool["id"] for tool in tools if tool.get("id")}
    save_state(seen_ids.union(new_ids))
    
    if tools:
        print(f"📂 Incremental Product Hunt data saved to {OUTPUT_FILE}")
    else:
        print(f"No new Product Hunt tools found. Wrote empty incremental output to {OUTPUT_FILE}")

if __name__ == "__main__": 
    main()
