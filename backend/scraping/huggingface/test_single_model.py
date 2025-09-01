import requests
from bs4 import BeautifulSoup
import re
import random
from datetime import datetime
import pprint

# --- Helper Function ---
def generate_tool_id(name):
    """Generates a URL-friendly slug from the tool name."""
    if not name: return None
    # Hugging Face names are often 'author/model', we replace '/' with '--'
    name = name.replace('/', '--')
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

# --- Main script logic ---
# A sample Hugging Face model URL for testing
tool_page_url = "https://huggingface.co/openai-community/gpt2" 

print(f"Scraping single model for testing: {tool_page_url}")

tool_data = {}

try:
    response = requests.get(tool_page_url, headers={'User-Agent': 'Mozilla/5.0'})
    response.raise_for_status()

    soup = BeautifulSoup(response.content, 'html.parser')

    # --- Data Extraction Logic for Hugging Face ---
    
    # Get Name (the h1 tag)
    name_tag = soup.find('h1')
    name = name_tag.get_text(strip=True) if name_tag else "Name not found"
    tool_data['name'] = name
    tool_data['id'] = generate_tool_id(name)

    # Get Description (This is harder as there's no single description tag)
    # We will take the first paragraph from the main content area as a proxy
    description_tag = soup.select_one("div.prose > p")
    tool_data['description'] = description_tag.get_text(strip=True) if description_tag else "Description not found on page."

    # Get Popularity (Likes)
    # The likes count is in a button with a specific data-testid
    likes_tag = soup.find('button', {'data-testid': 'like'})
    popularity = None
    if likes_tag:
        likes_text = likes_tag.get_text(strip=True).replace('k', '000').replace('M', '000000')
        # Find all numbers in the string
        numbers = re.findall(r'\d+', likes_text)
        if numbers:
            popularity = int(numbers[0])
    tool_data['popularity'] = popularity

    # Get Categories (Tags)
    # Tags are in links within a specific container
    tags_container = soup.find('div', class_='flex flex-wrap gap-x-2 gap-y-1.5')
    categories = []
    if tags_container:
        tag_links = tags_container.find_all('a')
        categories = [link.get_text(strip=True) for link in tag_links]
    tool_data['categories'] = categories
    
    # --- Set other fields for our schema ---
    tool_data['website'] = tool_page_url # The page itself is the primary link
    tool_data['pricingModel'] = "Open Source" # Most models are free to use
    tool_data['model'] = name # The tool name is the model
    tool_data['github'] = None
    tool_data['docs'] = None
    tool_data['keyFeatures'] = []
    tool_data['useCases'] = categories # The tags often serve as use cases
    tool_data['pros'] = []
    tool_data['cons'] = []
    tool_data['integrations'] = []
    tool_data['alternatives'] = []
    tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d")
    tool_data['trendScore'] = random.randint(70, 95)

except requests.RequestException as e:
    print(f"An error occurred: {e}")

# --- Print the final, organized data ---
if tool_data:
    print("\n--- COMPLETE FRONTEND-READY DATA ---")
    pprint.pprint(tool_data)
    print("------------------------------------\n")
else:
    print("Could not scrape any data.")