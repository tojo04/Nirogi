import requests
import pandas as pd
from urllib.parse import quote
from playwright.sync_api import sync_playwright
from serpapi import GoogleSearch

SERPAPI_KEY = "c503d3982928b9e362f9422fc06976db7db142872cdf72a94b4f83eb608ca5e0"

def get_pharmeasy_link(query):
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
        print(f"🔗 Found: {link}")
        if "pharmeasy.in/online-medicine-order/" in link:
            print(f"✅ Using link: {link}")
            return link

    print("❌ No valid PharmEasy link found.")
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

        print("✅ Extracted:")
        print(f"Name: {name}")
        print(f"Price: ₹{price}")
        print(f"MRP: ₹{mrp}")
        print(f"Discount: {discount}%")

        return {
            "pharmacy": "PharmEasy",
            "name": name,
            "price": price,
            "mrp": mrp,
            "discount_percent": discount,
            "link": link
        }
if __name__ == "__main__":
    query = "Cetcip 10mg"
    link = get_pharmeasy_link(query)
    if link:
        data = scrape_pharmeasy_product(link)

        try:
            df_existing = pd.read_csv("best_pharmeasy_product.csv")
        except FileNotFoundError:
            df_existing = pd.DataFrame()

        df_new = pd.DataFrame([data])
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
        df_combined.to_csv("best_pharmeasy_product.csv", index=False)
        print("\n💾 Data saved to best_pharmeasy_product.csv")
    else:
        print("❌ Product not found.")
