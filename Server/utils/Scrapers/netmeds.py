import json
import sys
import requests
from urllib.parse import quote
import re
from playwright.sync_api import sync_playwright

def get_netmeds_link(query):
    # Use on-site search to avoid external dependencies
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        search_url = f"https://www.netmeds.com/catalogsearch/result?q={quote(query)}"
        page.goto(search_url, timeout=60000)
        page.wait_for_timeout(5000)
        try:
            el = page.query_selector("a[href*='/prescriptions/']") or page.query_selector("a[href*='/non-prescriptions/']") or page.query_selector("a[href*='/product/']")
            if el:
                href = el.get_attribute("href")
                link = href if href.startswith("http") else f"https://www.netmeds.com{href}"
                print(f"✅ Netmeds link: {link}", file=sys.stderr)
                browser.close()
                return link
        except Exception as e:
            print(f"❌ Netmeds search error: {e}", file=sys.stderr)
        browser.close()
        print("❌ No valid Netmeds product link found.", file=sys.stderr)
        return None

def scrape_netmeds_product(link):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=20000)

        try:
            page.wait_for_selector("div.price-box", timeout=6000)
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
    link = get_netmeds_link(query)
    if link:
        data = scrape_netmeds_product(link)
        print(json.dumps(data))
    else:
        print(json.dumps({"error": "Product not found", "query": query}))
        sys.exit(1)
