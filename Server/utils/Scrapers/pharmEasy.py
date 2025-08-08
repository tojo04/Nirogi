import json
import os
import sys
import requests
from urllib.parse import quote
from playwright.sync_api import sync_playwright

def get_pharmeasy_link(query):
    # Prefer direct on-site search to avoid SerpAPI dependency differences
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        search_url = f"https://pharmeasy.in/search/all?name={quote(query)}"
        page.goto(search_url, timeout=60000)
        page.wait_for_timeout(5000)
        try:
            el = page.query_selector("a[href*='/online-medicine-order/']")
            if el:
                href = el.get_attribute("href")
                link = href if href.startswith("http") else f"https://pharmeasy.in{href}"
                print(f"✅ PharmEasy link: {link}", file=sys.stderr)
                browser.close()
                return link
        except Exception as e:
            print(f"❌ PharmEasy search error: {e}", file=sys.stderr)
        browser.close()
        print("❌ No valid PharmEasy link found.", file=sys.stderr)
        return None
def scrape_pharmeasy_product(link):
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
        import re
        price = None
        try:
            price_el = page.query_selector("span.PriceInfo_unitPriceDecimal__i3Shz") or page.query_selector("span[class*='PriceInfo']")
            if price_el:
                txt = price_el.inner_text()
                m = re.search(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", txt)
                if m:
                    price = float(m.group(1).replace(',', ''))
        except:
            pass

        # MRP (original)
        mrp = None
        try:
            mrp_el = page.query_selector("span.PriceInfo_striked__fmcJv") or page.query_selector("span[class*='PriceInfo']")
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
            discount_el = page.query_selector("div.PriceInfo_gcdDiscountPercent__FvJsG")
            if discount_el:
                discount_text = discount_el.inner_text().replace("% OFF", "").strip()
                if discount_text:
                    discount = float(discount_text)
            elif price and mrp and mrp > 0 and mrp >= price:
                discount = round((1 - (price / mrp)) * 100, 2)
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
