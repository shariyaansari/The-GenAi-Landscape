import requests
from bs4 import BeautifulSoup
import time
import json
import re
import random
from datetime import datetime

# (Helper functions like scrape_section_content and generate_tool_id remain the same)
def generate_tool_id(name):
    if not name or name == "Name not found": return None
    s = name.lower().strip(); s = re.sub(r'[\s\.]+', '-', s); s = re.sub(r'[^\w\-]', '', s)
    return s

def scrape_section_content(soup, heading_text):
    try:
        heading_tag = soup.find(("h2", "h3"), string=lambda t: t and heading_text.lower() in t.lower())
        if not heading_tag: return None
        next_element = heading_tag.find_next_sibling()
        if not next_element: return None
        if next_element.name == 'ul':
            list_items = next_element.find_all('li')
            return [item.get_text(strip=True) for item in list_items if item.get_text(strip=True)]
        elif next_element.name == 'p':
            return next_element.get_text(strip=True)
        else:
            return None
    except Exception:
        return None

def scrape_header_info(soup):
    header_data = {"categories": [], "pricingModel": None, "popularity": None}
    try:
        category_label_span = soup.find("span", string=re.compile(r"AI Categories", re.I))
        if category_label_span:
            for sibling in category_label_span.find_next_siblings("a"):
                header_data["categories"].append(sibling.get_text(strip=True))
        pricing_label_span = soup.find("span", string=re.compile(r"Pricing Model", re.I))
        if pricing_label_span:
            full_text = pricing_label_span.parent.get_text(strip=True)
            pricing_value = re.sub(r'Pricing Model:\s*', '', full_text, flags=re.IGNORECASE).strip()
            header_data["pricingModel"] = pricing_value
        favorites_tag = soup.find("button", {"aria-label": "Add to favorites"})
        if favorites_tag:
             count_text = favorites_tag.get_text(strip=True)
             if count_text.isdigit():
                header_data["popularity"] = int(count_text)
    except Exception:
        pass
    return header_data

def main():
    try:
        with open("futurepedia_urls.txt", "r") as f:
            urls_to_scrape = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print("Error: futurepedia_urls.txt not found.")
        return

    all_tools_data = []
    total_urls = len(urls_to_scrape)
    print(f"Starting to scrape {total_urls} Futurepedia pages...")

    for index, url in enumerate(urls_to_scrape):
        print(f"Scraping ({index + 1}/{total_urls}): {url}")
        
        try:
            response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            if response.status_code != 200:
                print(f"  -> Failed with status code {response.status_code}. Skipping.")
                continue

            soup = BeautifulSoup(response.content, "html.parser")
            
            tool_data = {}
            name_tag = soup.find("h1")
            name = name_tag.get_text(strip=True) if name_tag else "Name not found"
            
            if name == "Name not found": continue

            tool_data['name'] = name
            tool_data['id'] = generate_tool_id(name)
            
            # --- NEW: EXTRACT REVIEW COUNT AND RATING ---
            try:
                # Futurepedia sometimes has a link to a reviews tab
                review_count_element = soup.find('a', href='#reviews')
                if review_count_element:
                    review_text = review_count_element.get_text(strip=True)
                    numbers = re.findall(r'\d+', review_text)
                    tool_data['reviewCount'] = int(numbers[0]) if numbers else None
                else:
                    tool_data['reviewCount'] = None
                
                # Look for a star rating element
                rating_element = soup.find('div', class_='text-xl font-bold')
                if rating_element and '.' in rating_element.get_text():
                     tool_data['rating'] = float(rating_element.get_text(strip=True))
                else:
                    tool_data['rating'] = None

            except (AttributeError, ValueError):
                tool_data['reviewCount'] = None
                tool_data['rating'] = None

            # --- (Rest of the scraping logic is the same) ---
            header_info = scrape_header_info(soup)
            tool_data['categories'] = header_info['categories']
            tool_data['pricingModel'] = header_info['pricingModel']
            tool_data['popularity'] = header_info['popularity']
            
            website_tag = soup.find("a", {"data-tool-placement": "tool-listing"})
            tool_data['website'] = website_tag['href'] if website_tag else None
            
            tool_data['description'] = scrape_section_content(soup, "what is")
            tool_data['keyFeatures'] = scrape_section_content(soup, "Key Features") or []
            tool_data['useCases'] = scrape_section_content(soup, "Who is Using") or []
            tool_data['pros'] = scrape_section_content(soup, "Pros") or []
            tool_data['cons'] = scrape_section_content(soup, "Cons") or []

            # Set defaults for fields not on Futurepedia
            tool_data['github'] = None; tool_data['docs'] = None; tool_data['model'] = None; tool_data['integrations'] = []; tool_data['alternatives'] = [];
            tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d"); tool_data['trendScore'] = random.randint(70, 95)
            
            all_tools_data.append(tool_data)
            time.sleep(1) 

        except requests.RequestException as e:
            print(f"  -> An error occurred for {url}: {e}. Skipping.")
            continue

    print(f"\nScraping complete! Gathered data for {len(all_tools_data)} tools.")

    if all_tools_data:
        json_filename = "futurepedia_data.json"
        with open(json_filename, "w") as f:
            json.dump(all_tools_data, f, indent=2)
        print(f"✅ All data successfully saved to {json_filename}")

if __name__ == "__main__":
    main()

