import time
import re
import random
from datetime import datetime
import pprint

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from bs4 import BeautifulSoup

# --- Helper Functions ---
def generate_tool_id(name):
    """Generates a URL-friendly slug from the tool name."""
    if not name or name == "Name not found":
        return None
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

# --- THIS IS THE UPDATED FUNCTION ---
def scrape_header_info(soup):
    """Scrapes data like pricing, all categories, and popularity."""
    # Note: 'categories' is now a list
    header_data = {"categories": [], "pricingModel": None, "popularity": None}
    try:
        # --- UPDATED LOGIC FOR ALL CATEGORIES ---
        # Find the <span> with the text "AI Categories:"
        category_label_span = soup.find("span", string=re.compile(r"AI Categories", re.I))
        if category_label_span:
            # Find all subsequent sibling <a> tags and add them to a list
            for sibling in category_label_span.find_next_siblings("a"):
                header_data["categories"].append(sibling.get_text(strip=True))

        # --- Logic for Pricing Model remains the same ---
        pricing_label_span = soup.find("span", string=re.compile(r"Pricing Model", re.I))
        if pricing_label_span:
            full_text = pricing_label_span.parent.get_text(strip=True)
            pricing_value = re.sub(r'Pricing Model:\s*', '', full_text, flags=re.IGNORECASE).strip()
            header_data["pricingModel"] = pricing_value

        # --- Logic for popularity remains the same ---
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
tool_page_url = "https://www.futurepedia.io/tool/google-gemini"

print("Initializing Selenium WebDriver...")
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)

print(f"Scraping single tool for testing: {tool_page_url}")

try:
    driver.get(tool_page_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "tool-alternatives"))
    )
    print("Dynamic content has loaded.")
    page_source = driver.page_source
    
    soup = BeautifulSoup(page_source, "html.parser")
    tool_data = {}

    name = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Name not found"
    tool_data['name'] = name
    tool_data['id'] = generate_tool_id(name)
    tool_data['description'] = scrape_section_content(soup, "what is")

    header_info = scrape_header_info(soup)
    tool_data['categories'] = header_info['categories'] # Note the plural 'categories'
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

    print("\n--- COMPLETE FRONTEND-READY DATA ---")
    pprint.pprint(tool_data)
    print("------------------------------------\n")

finally:
    driver.quit()
    print("WebDriver closed.")