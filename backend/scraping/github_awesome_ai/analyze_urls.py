from urllib.parse import urlparse
from collections import Counter

def main():
    try:
        with open("github_awesome_ai_urls.txt", "r") as f:
            urls = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print("Error: github_awesome_ai_urls.txt not found. Please run the get_tool_urls.py script first.")
        return

    # Extract the base domain from each URL
    domains = []
    for url in urls:
        try:
            # urlparse().netloc gives the domain like 'www.google.com'
            domain = urlparse(url).netloc
            # Remove 'www.' prefix for better grouping
            if domain.startswith('www.'):
                domain = domain[4:]
            if domain:
                domains.append(domain)
        except Exception:
            # Ignore malformed URLs
            continue

    # Count the occurrences of each domain
    domain_counts = Counter(domains)

    print("--- Domain Analysis Complete ---")
    print(f"Found {len(urls)} total URLs from {len(domain_counts)} unique domains.")
    print("\nTop 20 most frequent domains:")

    # Print the 20 most common domains
    for domain, count in domain_counts.most_common(20):
        print(f"- {domain}: {count} links")

if __name__ == "__main__":
    main()