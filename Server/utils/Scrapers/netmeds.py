import json
import sys
import requests
from urllib.parse import quote
from playwright.sync_api import sync_playwright

SERPAPI_KEY = "c503d3982928b9e362f9422fc06976db7db142872cdf72a94b4f83eb608ca5e0"  # Replace with your real key

def get_netmeds_link_from_serpapi(query):
    params = {
        "engine": "google",
        "q": f"{query} site:netmeds.com",
        "api_key": SERPAPI_KEY
    }

    try:
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        results = data.get("organic_results", [])
        for result in results:
            link = result.get("link", "")
            if "/prescriptions/" in link:
                print(f"✅ Found product link: {link}")
                return link
    except Exception as e:
        print(f"❌ Error from SerpAPI: {e}")

    print("❌ No valid Netmeds product link found.")
    return None

def scrape_netmeds_product(link):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)

        try:
            page.wait_for_selector("div.price-box", timeout=8000)
        except:
            print("⚠️ Product price section didn’t load.")

        # Name
        try:
            name_el = page.query_selector("h1")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Discounted Price
        try:
            price_el = page.query_selector("span.final-price")
            price_text = price_el.inner_text().replace("₹", "").strip() if price_el else None
            price = float(price_text) if price_text else None
        except:
            price = None

        # MRP
        try:
            mrp_el = page.query_selector("span.price strike")
            mrp_text = mrp_el.inner_text().replace("₹", "").strip() if mrp_el else None
            mrp = float(mrp_text) if mrp_text else None
        except:
            mrp = None

        # Discount %
        try:
            discount_el = page.query_selector("span.disc-price")
            discount_text = discount_el.inner_text().replace("Save", "").replace("%", "").replace(" ", "").strip() if discount_el else "0"
            discount = float(discount_text) if discount_text else 0.0
        except:
            discount = 0.0

        browser.close()

        return {
            "pharmacy": "Netmeds",
            "name": name,
            "price": price,
            "mrp": mrp,
            "discount_percent": discount,
            "link": link
        }

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "Cetcip 10mg"
    link = get_netmeds_link_from_serpapi(query)
    if link:
        data = scrape_netmeds_product(link)
        print(json.dumps(data))
    else:
        print(json.dumps({"error": "Product not found", "query": query}))
        sys.exit(1)
