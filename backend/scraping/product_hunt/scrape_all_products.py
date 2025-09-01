# (The imports and helper functions at the top remain the same)
import time
import re
import random
from datetime import datetime
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def generate_tool_id(name):
    if not name: return None
    s = name.lower().strip()
    s = re.sub(r'[\s\.]+', '-', s)
    s = re.sub(r'[^\w\-]', '', s)
    return s

def main():
    try:
        with open("product_hunt_urls.txt", "r") as f:
            urls_to_scrape = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print("Error: product_hunt_urls.txt not found.")
        return

    options = webdriver.ChromeOptions(); options.add_argument("--headless"); # Simplified for brevity
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    print("WebDriver initialized.")
    
    all_tools_data = []
    total_urls = len(urls_to_scrape)
    print(f"Starting to scrape {total_urls} Product Hunt pages...")

    for index, url in enumerate(urls_to_scrape):
        print(f"Scraping ({index + 1}/{total_urls}): {url}")
        
        tool_data = {}
        try:
            driver.get(url)
            WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            time.sleep(2)
            
            # --- (Existing data extraction is the same) ---
            try:
                name = driver.find_element(By.TAG_NAME, 'h1').text
                tool_data['name'] = name; tool_data['id'] = generate_tool_id(name)
            except NoSuchElementException: tool_data['name'] = "Name not found"

            if tool_data.get('name') == "Name not found": continue

            try: tool_data['description'] = driver.find_element(By.TAG_NAME, 'h2').text
            except NoSuchElementException: tool_data['description'] = None
            
            # --- NEW: EXTRACT REVIEW COUNT ---
            try:
                # Find the link/button that leads to reviews/comments
                reviews_link = driver.find_element(By.XPATH, "//a[contains(., 'reviews')] | //button[contains(., 'reviews')] | //a[contains(., 'comments')] | //button[contains(., 'comments')]")
                # Extract the number from the text
                review_text = reviews_link.text
                numbers = re.findall(r'\d+', review_text)
                if numbers:
                    tool_data['reviewCount'] = int(numbers[0])
                else:
                    tool_data['reviewCount'] = None
            except NoSuchElementException:
                tool_data['reviewCount'] = None

            # We don't have a reliable star rating from Product Hunt
            tool_data['rating'] = None 
            
            # (The rest of the extraction logic is the same)
            try:
                upvote_text = driver.find_element(By.CSS_SELECTOR, "div[class*='styles_bigButtonCount']").text
                tool_data['popularity'] = int(upvote_text.replace(',', ''))
            except (NoSuchElementException, ValueError): tool_data['popularity'] = None
            try:
                topic_elements = driver.find_elements(By.XPATH, "//a[contains(@href, '/topics/')]")
                tool_data['categories'] = [elem.text for elem in topic_elements if elem.text]
            except NoSuchElementException: tool_data['categories'] = []
            try:
                link_element = driver.find_element(By.CSS_SELECTOR, "a[data-test='product-header-visit-button']")
                tool_data['website'] = link_element.get_attribute('href')
            except NoSuchElementException: tool_data['website'] = None

            tool_data['pricingModel'] = "Check Website"; tool_data['github'] = None; tool_data['docs'] = None; tool_data['keyFeatures'] = []; tool_data['useCases'] = []; tool_data['pros'] = []; tool_data['cons'] = []; tool_data['model'] = None; tool_data['integrations'] = []; tool_data['alternatives'] = []; tool_data['releaseDate'] = datetime.now().strftime("%Y-%m-%d"); tool_data['trendScore'] = random.randint(70, 95)
            
            all_tools_data.append(tool_data)
            
        except (TimeoutException, Exception) as e:
            print(f"  -> An error occurred for {url}: {e}. Skipping.")
            continue

    driver.quit()
    print("\nWebDriver closed.")

    if all_tools_data:
        json_filename = "product_hunt_data.json"
        with open(json_filename, "w") as f:
            json.dump(all_tools_data, f, indent=2)
        print(f"✅ All data successfully saved to {json_filename}")

if __name__ == "__main__":
    main()
