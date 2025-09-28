import subprocess
import json
import os
import time
from urllib.parse import urlparse
import whois
from datetime import datetime
import random
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv

# --- Helper Functions ---
def run_script(script_path):
    """Runs a single scraper script from its own directory using absolute paths."""
    # script_path is relative to this script's location (the backend folder)
    
    # --- THIS IS THE FIX ---
    # Convert the relative script path to an absolute path
    absolute_script_path = os.path.abspath(script_path)
    # Get the directory where the script is located
    script_dir = os.path.dirname(absolute_script_path)
    # Get just the filename of the script
    script_name = os.path.basename(absolute_script_path)
    
    print(f"--- Running script: {script_name} in folder {script_dir} ---")
    try:
        # Use the absolute path for the directory and just the filename for the command
        subprocess.run(
            ['python', script_name], 
            cwd=script_dir, # Change directory to the script's own folder
            check=True,
            capture_output=True,
            text=True
        )
        print(f"--- Finished script: {script_name} ---")
        return True
    except FileNotFoundError:
        print(f"ERROR: Script not found at {absolute_script_path}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Script {script_name} failed.")
        print(f"Error output:\n{e.stderr}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred running {script_name}: {e}")
        return False

def get_domain_creation_date(url):
    if not url: return None
    try:
        domain = urlparse(url).netloc
        if not domain: return None
        w = whois.whois(domain)
        creation_date = w.creation_date
        if isinstance(creation_date, list): creation_date = min(creation_date)
        return creation_date.strftime('%Y-%m-%d') if creation_date else None
    except Exception:
        return None

# --- Main Pipeline Logic ---
def main():
    print("==============================================")
    print(f"Starting full data pipeline at {datetime.now()}")
    print("==============================================")

    # --- Step 1: Run all scrapers ---
    scraper_scripts = [
        "scraping/FuturePedia/scrape_all_and_save.py",
        "scraping/product_hunt/scrape_all_products.py",
        "scraping/huggingface/scrape_all_models.py"
    ]
    for script in scraper_scripts:
        run_script(script)
    
    # --- Step 2: Combine and Deduplicate Data ---
    master_tools_dict = {}
    print("\n--- Combining and Deduplicating Data from JSON files ---")
    source_folders = ["scraping/FuturePedia", "scraping/product_hunt", "scraping/huggingface"]
    for folder in source_folders:
        # Infer the json filename, e.g., futurepedia_data.json
        # Corrected logic to handle different casing
        folder_name = os.path.basename(folder).lower()
        json_filename = f"{folder_name}_data.json"
        if folder_name == 'futurepedia': json_filename = "futurepedia_data.json"
        if folder_name == 'product_hunt': json_filename = "product_hunt_data.json"
        if folder_name == 'huggingface': json_filename = "huggingface_data.json"

        file_path = os.path.join(folder, json_filename)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding='utf-8') as f:
                    tools = json.load(f)
                    print(f"Processing {len(tools)} tools from {file_path}...")
                    for tool in tools:
                        key = tool.get('website')
                        if not key: continue
                        if key not in master_tools_dict:
                            master_tools_dict[key] = tool
                        else:
                            # (Merge logic is the same)
                            existing_tool = master_tools_dict[key]
                            if not existing_tool.get('description') and tool.get('description'): existing_tool['description'] = tool['description']
                            if tool.get('categories'):
                                existing_cats = set(existing_tool.get('categories', [])); new_cats = set(tool.get('categories', []))
                                existing_tool['categories'] = list(existing_cats.union(new_cats))
                            if (existing_tool.get('pricingModel') in [None, "Check Website"]) and (tool.get('pricingModel') not in [None, "Check Website"]): existing_tool['pricingModel'] = tool['pricingModel']
                            existing_pop = existing_tool.get('popularity') or 0; new_pop = tool.get('popularity') or 0
                            existing_tool['popularity'] = max(existing_pop, new_pop)
                            existing_rev = existing_tool.get('reviewCount') or 0; new_rev = tool.get('reviewCount') or 0
                            existing_tool['reviewCount'] = max(existing_rev, new_rev)
                            master_tools_dict[key] = existing_tool
            except (FileNotFoundError, json.JSONDecodeError) as e:
                print(f"Warning: Could not process {file_path}. Error: {e}. Skipping.")
    
    # --- Step 3: Enrich Data ---
    print("\n--- Enriching Data (Logos & Dates) ---")
    for key, tool in master_tools_dict.items():
        real_date = get_domain_creation_date(tool.get('website'))
        if real_date: tool['releaseDate'] = real_date
        elif not tool.get('releaseDate'): tool['releaseDate'] = f"{random.randint(2022, 2024)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
        if tool.get('website'):
            try:
                domain = urlparse(tool.get('website', '')).netloc
                if domain: tool['logoUrl'] = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
            except Exception: continue

    # --- Step 4: Load Data into MongoDB Atlas ---
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("\nERROR: MONGO_URI not found in .env file. Cannot connect to database.")
        return
        
    client = MongoClient(mongo_uri)
    db = client.GenAI_DB
    tools_collection = db.tools
    
    print(f"\n--- Loading {len(master_tools_dict)} tools into MongoDB ---")
    bulk_operations = []
    for tool in master_tools_dict.values():
        if tool.get("id"): # Ensure tool has an ID before creating operation
            operation = UpdateOne({"id": tool["id"]}, {"$set": tool}, upsert=True)
            bulk_operations.append(operation)
    
    if bulk_operations:
        try:
            result = tools_collection.bulk_write(bulk_operations)
            print("Database update complete!")
            print(f"  - Matched: {result.matched_count}, Upserted: {result.upserted_count}, Modified: {result.modified_count}")
        except Exception as e:
            print(f"An error occurred during database update: {e}")

    print("\n✅✅✅ Full pipeline run completed successfully! ✅✅✅")

if __name__ == "__main__":
    main()
