import pandas as pd
from urllib.parse import quote
from playwright.sync_api import sync_playwright

def get_1mg_product_link_from_search(page, query):
    search_url = f"https://www.1mg.com/search/all?name={quote(query)}"
    print(f"🔍 Searching: {search_url}")
    page.goto(search_url, timeout=60000)
    page.wait_for_timeout(5000)  # Let JS render fully

    # Reliable selector for first product link
    try:
        first_result = page.query_selector("a[href^='/drugs/']")
        if first_result:
            href = first_result.get_attribute("href")
            full_link = f"https://www.1mg.com{href}"
            print(f"✅ Found product link: {full_link}")
            return full_link
    except Exception as e:
        print(f"❌ Error while fetching product link: {e}")

    print("❌ No product found for query.")
    return None

def scrape_1mg_product(link):
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)

        # Wait until price info appears
        try:
            page.wait_for_selector("div[class*='DrugPriceBox']", timeout=8000)
        except:
            print("⚠️ DrugPriceBox didn't appear in time.")

        # Product Name
        try:
            name_el = page.query_selector("h1[class*='DrugHeader__title-content']")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Final Discounted Price
        try:
            price = None
            # First attempt: best-price block
            price_el = page.query_selector("div[class*='DrugPriceBox__best-price']")
            if price_el:
                price_text = price_el.inner_text().replace("₹", "").strip()
                if price_text:
                    price = float(price_text)
            # Fallback: direct price block
            if price is None:
                price_alt_el = page.query_selector("div[class*='DrugPriceBox__price']")
                if price_alt_el:
                    alt_text = price_alt_el.inner_text().replace("₹", "").strip()
                    if alt_text:
                        price = float(alt_text)
        except:
            price = None

        # Original MRP
        try:
            mrp_el = page.query_selector("span[class*='DrugPriceBox__slashed-price']")
            mrp_text = mrp_el.inner_text().replace("₹", "").strip() if mrp_el else None
            mrp = float(mrp_text) if mrp_text else None
        except:
            mrp = None

        # Discount %
        try:
            discount_el = page.query_selector("span[class*='DrugPriceBox__slashed-percent']")
            discount_text = discount_el.inner_text().replace("% OFF", "").strip() if discount_el else "0"
            discount = float(discount_text) if discount_text else 0.0
        except:
            discount = 0.0

        browser.close()

        print("✅ Extracted:")
        print(f"Name: {name}")
        print(f"Price: ₹{price}")
        print(f"MRP: ₹{mrp}")
        print(f"Discount: {discount}%")

        return {
            "pharmacy": "1mg",
            "name": name,
            "price": price,                   # Discounted price
            "mrp": mrp,                       # Original MRP
            "discount_percent": discount,     # Discount %
            "link": link
        }


def run_1mg_search(query):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        product_link = get_1mg_product_link_from_search(page, query)
        browser.close()
        return product_link

# Example usage
if __name__ == "__main__":
    query = "aricep 5 tablet"
    link = run_1mg_search(query)
    if link:
        data = scrape_1mg_product(link)

        # Load existing data if the CSV exists
        try:
            df_existing = pd.read_csv("best_1mg_product.csv")
        except FileNotFoundError:
            df_existing = pd.DataFrame()

        # Append new row
        df_new = pd.DataFrame([data])
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)

        # Save back to CSV
        df_combined.to_csv("best_1mg_product.csv", index=False)
        print("\n💾 Data saved to best_1mg_product.csv")

    else:
        print("❌ Product not found.")
