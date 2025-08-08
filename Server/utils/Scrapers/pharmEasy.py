import json
import os
import sys
import requests
from urllib.parse import quote
from playwright.sync_api import sync_playwright
from serpapi import GoogleSearch

SERPAPI_KEY = os.environ.get("SERPAPI_KEY")

def get_pharmeasy_link(query):
    if not SERPAPI_KEY:
        print(json.dumps({"error": "SERPAPI_KEY not set"}))
        sys.exit(1)
    params = {
        "engine": "google",
        "q": f"{query} site:pharmeasy.in",
        "api_key": SERPAPI_KEY
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    data = results.get("organic_results", [])

    for result in data:
        link = result.get("link", "").strip()
        print(f"🔗 Found: {link}", file=sys.stderr)
        if "pharmeasy.in/online-medicine-order/" in link:
            print(f"✅ Using link: {link}", file=sys.stderr)
            return link

    print("❌ No valid PharmEasy link found.", file=sys.stderr)
    return None
def scrape_pharmeasy_product(link):
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)
        page.wait_for_timeout(5000)  # Let JS render

        # Product name
        try:
            name_el = page.query_selector("h1.MedicineOverviewSection_medicineName__9K61u")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Price (discounted)
        try:
            price_el = page.query_selector("span.PriceInfo_unitPriceDecimal__i3Shz")
            price = float(price_el.inner_text().replace("₹", "").strip()) if price_el else None
        except:
            price = None

        # MRP (original)
        try:
            mrp_el = page.query_selector("span.PriceInfo_striked__fmcJv")
            mrp = float(mrp_el.inner_text().replace("₹", "").strip()) if mrp_el else None
        except:
            mrp = None

        # Discount %
        try:
            discount_el = page.query_selector("div.PriceInfo_gcdDiscountPercent__FvJsG")
            discount_text = discount_el.inner_text().replace("% OFF", "").strip() if discount_el else "0"
            discount = float(discount_text)
        except:
            discount = 0.0

        browser.close()

        return {
            "pharmacy": "PharmEasy",
            "name": name,
            "price": price,
            "mrp": mrp,
            "discount_percent": discount,
            "link": link
        }
if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "Cetcip 10mg"
    link = get_pharmeasy_link(query)
    if link:
        data = scrape_pharmeasy_product(link)
        print(json.dumps(data))
    else:
        print(json.dumps({"error": "Product not found", "query": query}))
        sys.exit(1)
