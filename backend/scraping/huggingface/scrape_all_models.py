# Save this file as: huggingface/scrape_all_models.py

import requests
from bs4 import BeautifulSoup
import re
import random
from datetime import datetime
import json
import time

# --- Helper Function ---
def generate_tool_id(name):
    """Generates a URL-friendly slug from the tool name."""
    if not name: return None
    name = name.replace('/', '--')
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

# --- Main script logic ---
def main():
    # --- Step 1: Read the master URL list ---
    # Note: We need to point to the file in the other folder
    try:
        with open("../github_awesome_ai/github_awesome_ai_urls.txt", "r") as f:
            all_urls = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print("Error: github_awesome_ai_urls.txt not found. Make sure it's in the correct folder.")
        return

    # --- Step 2: Filter for only Hugging Face URLs ---
    huggingface_urls = [url for url in all_urls if 'huggingface.co' in url]
    total_urls = len(huggingface_urls)
    
    if not huggingface_urls:
        print("No Hugging Face URLs found in the master list.")
        return
        
    print(f"Found {total_urls} Hugging Face URLs to scrape.")
    
    all_models_data = []

    # --- Step 3: Loop and scrape each URL ---
    for index, url in enumerate(huggingface_urls):
        print(f"Scraping ({index + 1}/{total_urls}): {url}")
        
        tool_data = {}
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            name_tag = soup.find('h1')
            name = name_tag.get_text(strip=True) if name_tag else "Name not found"
            
            if name == "Name not found":
                print(" -> Could not find model name. Skipping.")
                continue

            tool_data['name'] = name
            tool_data['id'] = generate_tool_id(name)

            description_tag = soup.select_one("div.prose > p")
            tool_data['description'] = description_tag.get_text(strip=True) if description_tag else "Description not found on page."

            likes_tag = soup.find('button', {'data-testid': 'like'})
            popularity = None
            if likes_tag:
                likes_text = likes_tag.get_text(strip=True).replace('k', '000').replace('M', '000000')
                numbers = re.findall(r'\d+', likes_text)
                if numbers:
                    popularity = int(numbers[0])
            tool_data['popularity'] = popularity

            tags_container = soup.find('div', class_='flex flex-wrap gap-x-2 gap-y-1.5')
            categories = []
            if tags_container:
                tag_links = tags_container.find_all('a')
                categories = [link.get_text(strip=True) for link in tag_links]
            tool_data['categories'] = categories
            
            tool_data['website'] = url
            tool_data['pricingModel'] = "Open Source"
            tool_data['model'] = name
            tool_data['github'] = None
            tool_data['docs'] = None
            tool_data['keyFeatures'] = []
            tool_data['useCases'] = categories
            tool_data['pros'] = []
            tool_data['cons'] = []
            tool_data['integrations'] = []
            tool_data['alternatives'] = []
            tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d")
            tool_data['trendScore'] = random.randint(70, 95)
            
            all_models_data.append(tool_data)
            time.sleep(1) # Be polite

        except requests.RequestException as e:
            print(f"  -> An error occurred for {url}: {e}. Skipping.")
            continue

    # --- Step 4: Save the final data ---
    if all_models_data:
        filename = "huggingface_data.json"
        with open(filename, "w") as f:
            json.dump(all_models_data, f, indent=2)
        print(f"\n✅ All data successfully saved to {filename}")
    else:
        print("\n❌ No data was collected.")

if __name__ == "__main__":
    main()