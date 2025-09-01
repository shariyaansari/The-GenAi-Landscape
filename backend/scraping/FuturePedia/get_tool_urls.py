import requests
from bs4 import BeautifulSoup

# The URL of the sitemap we identified
sitemap_url = "https://www.futurepedia.io/sitemap_tools.xml"

print(f"Fetching sitemap from: {sitemap_url}")

# Use requests to get the content of the sitemap
response = requests.get(sitemap_url)

# Check if the request was successful
if response.status_code == 200:
    # Use BeautifulSoup to parse the XML content
    # We specify 'xml' as the parser
    soup = BeautifulSoup(response.content, "xml")
    
    # Find all the <loc> tags, which contain the URLs
    urls = soup.find_all("loc")
    
    # Extract the text from each tag and store it in a list
    tool_links = [url.get_text() for url in urls]
    
    print(f"Success! Found {len(tool_links)} tool URLs.")
    
    # Let's save these URLs to a file for the next step
    with open("futurepedia_urls.txt", "w") as f:
        for link in tool_links:
            f.write(f"{link}\n")
            
    print("All URLs have been saved to futurepedia_urls.txt")
    
else:
    print(f"Failed to fetch sitemap. Status code: {response.status_code}")