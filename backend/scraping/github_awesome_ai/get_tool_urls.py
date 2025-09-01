import requests
from bs4 import BeautifulSoup
import time

def main():
    start_url = "https://github.com/filipecalegario/awesome-generative-ai"
    all_tool_urls = []
    
    print(f"Starting to fetch tool URLs from: {start_url}")
    
    try:
        response = requests.get(start_url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status() # Will raise an error for bad status codes

        soup = BeautifulSoup(response.content, "html.parser")
        
        # Find the main content area of the README file on GitHub
        content_area = soup.find('article', class_='markdown-body')
        
        if not content_area:
            print("Could not find the main content area. The page structure might have changed.")
            return

        # On these lists, tools are typically list items (<li>) with a single link (<a>)
        # We look for all list items within the content area
        list_items = content_area.find_all('li')
        
        for item in list_items:
            link = item.find('a')
            # Ensure the list item has a link and the link has an href
            if link and link.has_attr('href'):
                url = link['href']
                # Filter out internal links (like to other sections of the document)
                if url.startswith('http'):
                    all_tool_urls.append(url)

    except requests.RequestException as e:
        print(f"An error occurred: {e}. Stopping.")

    # Save the collected URLs, removing duplicates
    unique_urls = list(dict.fromkeys(all_tool_urls))

    if unique_urls:
        filename = "github_awesome_ai_urls.txt"
        with open(filename, "w") as f:
            for url in unique_urls:
                f.write(f"{url}\n")
        print(f"\n✅ Success! Saved {len(unique_urls)} unique URLs to {filename}")
    else:
        print("\n❌ No URLs were collected.")

if __name__ == "__main__":
    main()