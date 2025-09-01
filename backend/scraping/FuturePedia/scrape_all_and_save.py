import time
import re
import random
from datetime import datetime
import json
import pprint

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from bs4 import BeautifulSoup

# --- All helper functions are finalized ---
def generate_tool_id(name):
    """Generates a URL-friendly slug from the tool name."""
    if not name or name == "Name not found":
        return None
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

def scrape_header_info(soup):
    """Scrapes data like pricing, all categories, and popularity."""
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

def scrape_section_content(soup, heading_text):
    """Finds a heading and extracts content from the next sibling (<ul> or <p>)."""
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

def scrape_alternatives(soup):
    """Scrapes the alternatives by directly finding the names inside the main container."""
    alternatives = []
    try:
        container = soup.find("div", id="tool-alternatives")
        if not container: return []
        name_tags = container.find_all("h3")
        for tag in name_tags:
            name = tag.get_text(strip=True)
            alt_id = generate_tool_id(name)
            if name and alt_id:
                alternatives.append({"id": alt_id, "name": name})
        return alternatives
    except Exception:
        return []

# --- Main script logic ---
def main():
    try:
        with open("futurepedia_urls.txt", "r") as f:
            urls_to_scrape = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print("Error: futurepedia_urls.txt not found. Make sure it's in the same folder.")
        return

    # Initialize Selenium WebDriver outside the loop
    print("Initializing Selenium WebDriver...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    print("WebDriver initialized.")

    all_tools_data = []
    total_urls = len(urls_to_scrape)
    
    print(f"Starting to scrape {total_urls} tool pages...")

    for index, url in enumerate(urls_to_scrape):
        print(f"Scraping ({index + 1}/{total_urls}): {url}")
        
        try:
            # Use driver to get page and wait for content
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "tool-alternatives"))
            )
            page_source = driver.page_source
            
            # Hand off to BeautifulSoup for parsing
            soup = BeautifulSoup(page_source, "html.parser")
            
            tool_data = {}
            name = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Name not found"
            
            # Skip if no name is found
            if name == "Name not found":
                print(" -> Could not find tool name. Skipping.")
                continue

            tool_data['name'] = name
            tool_data['id'] = generate_tool_id(name)
            tool_data['description'] = scrape_section_content(soup, "what is")

            header_info = scrape_header_info(soup)
            tool_data['categories'] = header_info['categories']
            tool_data['pricingModel'] = header_info['pricingModel']
            tool_data['popularity'] = header_info['popularity']

            website_tag = soup.find("a", {"data-tool-placement": "tool-listing"})
            tool_data['website'] = website_tag['href'] if website_tag else None
            tool_data['github'] = None
            tool_data['docs'] = None
            tool_data['keyFeatures'] = scrape_section_content(soup, "Key Features") or []
            tool_data['useCases'] = scrape_section_content(soup, "Who is Using") or []
            tool_data['pros'] = scrape_section_content(soup, "Pros") or []
            tool_data['cons'] = scrape_section_content(soup, "Cons") or []
            tool_data['model'] = scrape_section_content(soup, "Underlying Model")
            integrations_list = scrape_section_content(soup, "Integrations")
            tool_data['integrations'] = integrations_list if isinstance(integrations_list, list) else []
            tool_data['alternatives'] = scrape_alternatives(soup)
            tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d")
            tool_data['trendScore'] = random.randint(70, 95)
            
            all_tools_data.append(tool_data)
            
            # A small delay is still good practice
            time.sleep(0.5) 

        except Exception as e:
            print(f"  -> An error occurred for {url}: {e}. Skipping.")
            continue

    # Close the browser once the loop is finished
    driver.quit()
    print("\nWebDriver closed.")
    print(f"Scraping complete! Successfully gathered data for {len(all_tools_data)} out of {total_urls} tools.")

    # Save the final data to JSON
    if all_tools_data:
        json_filename = "frontend_ready_tools.json"
        with open(json_filename, "w") as f:
            json.dump(all_tools_data, f, indent=2)
        print(f"✅ All data successfully saved to {json_filename}")
    else:
        print("No data was collected. No file was saved.")

if __name__ == "__main__":
    main()