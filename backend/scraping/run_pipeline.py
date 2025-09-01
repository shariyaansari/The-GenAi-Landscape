# (All imports and functions at the top remain the same)
import json
import os
from urllib.parse import urlparse
import whois
from datetime import datetime
import random
from pymongo import MongoClient, UpdateOne

MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client.GenAI_DB
tools_collection = db.tools

def get_domain_creation_date(url):
    # (function code is unchanged)
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

def main():
    source_folders = ["scraping/futurepedia", "scraping/product_hunt", "scraping/huggingface"]
    master_tools_dict = {}
    print("Starting data combination...")

    for folder in source_folders:
        json_filename = f"{os.path.basename(folder)}_data.json"
        file_path = os.path.join(folder, json_filename)
        try:
            with open(file_path, "r") as f:
                tools = json.load(f)
                print(f"Processing {len(tools)} tools from {file_path}...")
                for tool in tools:
                    key = tool.get('website')
                    if not key: continue
                    if key not in master_tools_dict:
                        master_tools_dict[key] = tool
                    else:
                        existing_tool = master_tools_dict[key]
                        
                        # --- MERGE LOGIC - UPDATED ---
                        if not existing_tool.get('description') and tool.get('description'): existing_tool['description'] = tool['description']
                        if tool.get('categories'):
                            existing_cats = set(existing_tool.get('categories', [])); new_cats = set(tool.get('categories', []))
                            existing_tool['categories'] = list(existing_cats.union(new_cats))
                        if (existing_tool.get('pricingModel') in [None, "Check Website"]) and (tool.get('pricingModel') not in [None, "Check Website"]): existing_tool['pricingModel'] = tool['pricingModel']
                        
                        # Take the highest popularity and review counts
                        existing_pop = existing_tool.get('popularity') or 0; new_pop = tool.get('popularity') or 0
                        existing_tool['popularity'] = max(existing_pop, new_pop)
                        
                        existing_rev = existing_tool.get('reviewCount') or 0; new_rev = tool.get('reviewCount') or 0
                        existing_tool['reviewCount'] = max(existing_rev, new_rev)

                        master_tools_dict[key] = existing_tool
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not process {file_path}. Error: {e}. Skipping.")
    
    # (The rest of the script for enriching dates and logos is unchanged)
    print("\nEnriching data...")
    for key, tool in master_tools_dict.items():
        real_date = get_domain_creation_date(tool.get('website'))
        if real_date: tool['releaseDate'] = real_date
        elif not tool.get('releaseDate'): tool['releaseDate'] = f"{random.randint(2022, 2024)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
        if tool.get('website'):
            try:
                domain = urlparse(tool['website']).netloc
                if domain: tool['logoUrl'] = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
            except Exception: continue

    # (The database writing logic is unchanged)
    print(f"\nWriting {len(master_tools_dict)} tools to MongoDB...")
    bulk_operations = []
    for tool in master_tools_dict.values():
        operation = UpdateOne({"id": tool["id"]}, {"$set": tool}, upsert=True)
        bulk_operations.append(operation)
    if bulk_operations:
        try:
            result = tools_collection.bulk_write(bulk_operations)
            print("Database update complete!")
            print(f"  - Matched: {result.matched_count}, Upserted: {result.upserted_count}, Modified: {result.modified_count}")
        except Exception as e:
            print(f"An error occurred during database update: {e}")

    print("\n✅ Pipeline run complete!")

if __name__ == "__main__":
    main()

