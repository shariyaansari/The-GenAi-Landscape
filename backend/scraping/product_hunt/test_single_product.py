# Save this file as: product_hunt/test_single_product.py

import time
import re
import random
from datetime import datetime
import pprint

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
# --- THIS IS THE MISSING LINE ---
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- Helper Function ---
def generate_tool_id(name):
    """Generates a URL-friendly slug from the tool name."""
    if not name: return None
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

# --- Main script logic ---

tool_page_url = "https://www.producthunt.com/products/nuraform?utm_campaign=producthunt-api&utm_medium=api-v2&utm_source=Application%3A+AI+Tool+Scraper+%28ID%3A+219392%29" 

print("Initializing Selenium WebDriver...")
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument('--disable-gpu') 
driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
print(f"Scraping single product for testing: {tool_page_url}")

tool_data = {}

try:
    driver.get(tool_page_url)
    
    print("Waiting for page content to load...")
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.TAG_NAME, "h1"))
    )
    print("Page content loaded.")
    
    time.sleep(2) 
    
    # --- Data Extraction using Selenium's finders ---
    try:
        name = driver.find_element(By.TAG_NAME, 'h1').text
        tool_data['name'] = name
        tool_data['id'] = generate_tool_id(name)
    except NoSuchElementException:
        tool_data['name'] = "Name not found"
        tool_data['id'] = None

    try:
        tool_data['description'] = driver.find_element(By.TAG_NAME, 'h2').text
    except NoSuchElementException:
        tool_data['description'] = None

    try:
        upvote_text = driver.find_element(By.CSS_SELECTOR, "div[class*='styles_bigButtonCount']").text
        tool_data['popularity'] = int(upvote_text.replace(',', ''))
    except (NoSuchElementException, ValueError):
        tool_data['popularity'] = None

    try:
        topic_elements = driver.find_elements(By.XPATH, "//a[contains(@href, '/topics/')]")
        tool_data['categories'] = [elem.text for elem in topic_elements if elem.text]
    except NoSuchElementException:
        tool_data['categories'] = []

    try:
        link_element = driver.find_element(By.CSS_SELECTOR, "a[data-test='product-header-visit-button']")
        tool_data['website'] = link_element.get_attribute('href')
    except NoSuchElementException:
        tool_data['website'] = None

    # --- Set defaults for data not available on Product Hunt ---
    tool_data['pricingModel'] = "Check Website"
    tool_data['github'] = None
    tool_data['docs'] = None
    tool_data['keyFeatures'] = []
    tool_data['useCases'] = []
    tool_data['pros'] = []
    tool_data['cons'] = []
    tool_data['model'] = None
    tool_data['integrations'] = []
    tool_data['alternatives'] = []
    tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d")
    tool_data['trendScore'] = random.randint(70, 95)
    
except TimeoutException:
    print("Page took too long to load and timed out.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

finally:
    driver.quit()
    print("WebDriver closed.")

# --- Print the final, organized data ---
if tool_data:
    print("\n--- COMPLETE FRONTEND-READY DATA ---")
    pprint.pprint(tool_data)
    print("------------------------------------\n")
else:
    print("Could not scrape any data.")