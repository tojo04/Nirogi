import json
import os
import sys
import requests
from urllib.parse import quote
import re
from playwright.sync_api import sync_playwright

SERPAPI_KEY = os.environ.get("SERPAPI_KEY")

def get_netmeds_link_from_serpapi(query):
    if not SERPAPI_KEY:
        print(json.dumps({"error": "SERPAPI_KEY not set"}))
        sys.exit(1)
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
                print(f"✅ Found product link: {link}", file=sys.stderr)
                return link
    except Exception as e:
        print(f"❌ Error from SerpAPI: {e}", file=sys.stderr)

    print("❌ No valid Netmeds product link found.", file=sys.stderr)
    return None

def scrape_netmeds_product(link):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)

        try:
            page.wait_for_selector("div.price-box", timeout=8000)
        except:
            print("⚠️ Product price section didn’t load.", file=sys.stderr)

        # Name
        try:
            name_el = page.query_selector("h1")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Discounted Price
        price = None
        try:
            price_el = page.query_selector("span.final-price") or page.query_selector("span[class*='price']")
            if price_el:
                txt = price_el.inner_text()
                m = re.search(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", txt)
                if m:
                    price = float(m.group(1).replace(',', ''))
        except:
            pass

        # MRP
        mrp = None
        try:
            mrp_el = page.query_selector("span.price strike") or page.query_selector("strike")
            if mrp_el:
                txt = mrp_el.inner_text()
                m = re.search(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", txt)
                if m:
                    mrp = float(m.group(1).replace(',', ''))
        except:
            pass

        # Discount %
        try:
            discount = 0.0
            discount_el = page.query_selector("span.disc-price")
            if discount_el:
                discount_text = discount_el.inner_text().replace("Save", "").replace("%", "").replace(" ", "").strip()
                if discount_text:
                    discount = float(discount_text)
            elif price and mrp and mrp > 0 and mrp >= price:
                discount = round((1 - (price / mrp)) * 100, 2)
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
