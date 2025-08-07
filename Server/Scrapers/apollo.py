import requests
import pandas as pd
from playwright.sync_api import sync_playwright

SERPAPI_KEY = "c503d3982928b9e362f9422fc06976db7db142872cdf72a94b4f83eb608ca5e0"  # 🔐 Replace this with your SerpAPI key

def get_1mg_product_link(query):
    print(f"🔍 Searching SerpAPI for: {query}")
    params = {
        "engine": "google",
        "q": f"{query} site:1mg.com",
        "api_key": SERPAPI_KEY,
        "num": 1
    }
    response = requests.get("https://serpapi.com/search", params=params)
    data = response.json()

    for result in data.get("organic_results", []):
        link = result.get("link", "")
        if "1mg.com/drugs/" in link:
            print(f"✅ Found product link: {link}")
            return link
    print("❌ No valid 1mg link found.")
    return None

def scrape_1mg_product(link):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)

        # Wait for the price box to appear
        try:
            page.wait_for_selector("div[class*='DrugPriceBox']", timeout=8000)
        except:
            print("⚠️ DrugPriceBox didn't appear in time.")

        # Name
        try:
            name_el = page.query_selector("h1[class*='DrugHeader__title-content']")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Price (more tolerant)
        try:
            price_el = page.query_selector("div[class*='DrugPriceBox__best-price']")
            if not price_el:
                # fallback: look for any div with ₹ inside the DrugPriceBox
                price_el = page.query_selector("div[class*='DrugPriceBox'] >> text=₹")
            price = float(price_el.inner_text().replace("₹", "").strip()) if price_el else None
        except Exception as e:
            print(f"❌ Failed to get price: {e}")
            price = None

        # MRP
        try:
            mrp_el = page.query_selector("span[class*='DrugPriceBox__slashed-price']")
            mrp = float(mrp_el.inner_text().replace("₹", "").strip()) if mrp_el else None
        except:
            mrp = None

        # Discount
        try:
            discount_el = page.query_selector("span[class*='DrugPriceBox__slashed-percent']")
            discount = float(discount_el.inner_text().replace("% OFF", "").strip()) if discount_el else 0.0
        except:
            discount = 0.0

        browser.close()

        print("✅ Extracted Data:")
        print("Name:", name)
        print("Price:", price)
        print("MRP:", mrp)
        print("Discount %:", discount)

        return {
            "pharmacy": "1mg",
            "name": name,
            "price": price,
            "mrp": mrp,
            "discount_percent": discount,
            "link": link
        }

def run(query):
    product_url = get_1mg_product_link(query)
    if not product_url:
        return

    data = scrape_1mg_product(product_url)
    df = pd.DataFrame([data])
    df.to_csv("best_1mg_product.csv", index=False)
    print("📄 Saved to best_1mg_product.csv")

# Example usage
if __name__ == "__main__":
    run("aricep 5 tablet")
