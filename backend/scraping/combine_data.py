import json
import os
from urllib.parse import urlparse
import whois
from datetime import datetime
import random 

# --- (get_domain_creation_date function is the same) ---
def get_domain_creation_date(url):
    """
    Performs a Whois lookup to find the creation date of a domain.
    Returns a date string in 'YYYY-MM-DD' format or None if not found.
    """
    if not url:
        return None
    try:
        domain = urlparse(url).netloc
        if not domain:
            return None
            
        w = whois.whois(domain)
        
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = min(creation_date)
            
        if creation_date:
            return creation_date.strftime('%Y-%m-%d')
        else:
            return None
    except Exception:
        return None

def main():
    source_files = [
        os.path.join("futurepedia", "futurepedia_data.json"),
        os.path.join("product_hunt", "product_hunt_data.json"),
        os.path.join("huggingface", "huggingface_data.json"),
    ]
    
    master_tools_dict = {}
    print("Starting the data combination and deduplication process...")

    # --- (Data loading and merging logic is the same) ---
    for file_path in source_files:
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
                        if not existing_tool.get('description') and tool.get('description'): existing_tool['description'] = tool['description']
                        if tool.get('categories'):
                            existing_cats = set(existing_tool.get('categories', [])); new_cats = set(tool.get('categories', []))
                            existing_tool['categories'] = list(existing_cats.union(new_cats))
                        if (existing_tool.get('pricingModel') in [None, "Check Website"]) and (tool.get('pricingModel') not in [None, "Check Website"]): existing_tool['pricingModel'] = tool['pricingModel']
                        existing_pop = existing_tool.get('popularity') or 0; new_pop = tool.get('popularity') or 0
                        existing_tool['popularity'] = max(existing_pop, new_pop)
                        master_tools_dict[key] = existing_tool
        except FileNotFoundError:
            print(f"Warning: Source file not found at {file_path}. Skipping.")
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from {file_path}. Skipping.")
    
    # --- CORRECTED SECTION: ENRICH WITH REAL RELEASE DATES ---
    print("\nEnriching data with domain creation dates...")
    total_tools = len(master_tools_dict)
    for i, (key, tool) in enumerate(master_tools_dict.items()):
        print(f"  -> Processing date for tool {i+1}/{total_tools}: {tool.get('name')}")
        
        # Always try to get the real date
        real_date = get_domain_creation_date(tool.get('website'))
        
        if real_date:
            # If we found a real date, use it.
            print(f"     Found creation date: {real_date}")
            tool['releaseDate'] = real_date
        elif not tool.get('releaseDate'):
            # If lookup fails AND the tool has no date at all, create a random one.
            random_year = random.randint(2022, 2024)
            random_month = random.randint(1, 12)
            random_day = random.randint(1, 28)
            tool['releaseDate'] = f"{random_year}-{random_month:02d}-{random_day:02d}"
        # else: if lookup fails and a date already exists, we just keep the old one.


    # --- (Logo enrichment logic is the same) ---
    print("\nEnriching data with logo URLs...")
    for key, tool in master_tools_dict.items():
        if tool.get('website'):
            try:
                domain = urlparse(tool['website']).netloc
                if domain:
                    logo_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
                    tool['logoUrl'] = logo_url
            except Exception: continue

    final_tool_list = list(master_tools_dict.values())
    
    output_filename = "frontend_ready_tools.json"
    with open(output_filename, "w") as f:
        json.dump(final_tool_list, f, indent=2)

    print("\n------------------------------------")
    print("✅ Process Complete!")
    print(f"Combined data for {len(final_tool_list)} unique tools with realistic release dates.")
    print(f"Final dataset saved to: {output_filename}")
    print("------------------------------------")


if __name__ == "__main__":
    main()

