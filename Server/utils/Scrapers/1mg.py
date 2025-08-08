import json
import sys
from urllib.parse import quote
from playwright.sync_api import sync_playwright
import re

def get_1mg_product_link_from_search(page, query):
    search_url = f"https://www.1mg.com/search/all?name={quote(query)}"
    print(f"🔍 Searching: {search_url}", file=sys.stderr)
    page.goto(search_url, timeout=60000)
    page.wait_for_timeout(5000)  # Let JS render fully

    # Reliable selector for first product link
    try:
        first_result = page.query_selector("a[href^='/drugs/']") or page.query_selector("a[href*='/drugs/']")
        if first_result:
            href = first_result.get_attribute("href")
            full_link = f"https://www.1mg.com{href}"
            print(f"✅ Found product link: {full_link}", file=sys.stderr)
            return full_link
    except Exception as e:
        print(f"❌ Error while fetching product link: {e}", file=sys.stderr)

    print("❌ No product found for query.", file=sys.stderr)
    return None

def scrape_1mg_product(link):
    # from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(link, timeout=60000)

        # Wait until price info appears
        try:
            page.wait_for_selector("div[class*='DrugPriceBox']", timeout=8000)
        except:
            print("⚠️ DrugPriceBox didn't appear in time.", file=sys.stderr)

        # Product Name
        try:
            name_el = page.query_selector("h1[class*='DrugHeader__title-content']")
            name = name_el.inner_text().strip() if name_el else None
        except:
            name = None

        # Final Discounted Price (robust fallback)
        price = None
        try:
            # Attempt 1: known containers
            price_el = page.query_selector("div[class*='DrugPriceBox__best-price']") or page.query_selector("div[class*='DrugPriceBox__price']")
            if price_el:
                txt = price_el.inner_text()
                m = re.search(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", txt)
                if m:
                    price = float(m.group(1).replace(",", ""))
        except:
            pass

        # Original MRP (robust fallback)
        mrp = None
        try:
            mrp_el = page.query_selector("span[class*='DrugPriceBox__slashed-price']")
            if mrp_el:
                txt = mrp_el.inner_text()
                m = re.search(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", txt)
                if m:
                    mrp = float(m.group(1).replace(",", ""))
        except:
            pass

        # Fallback: scan whole page for prices if either is missing
        try:
            if price is None or mrp is None:
                html = page.content()
                amounts = [float(x.replace(',', '')) for x in re.findall(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", html)]
                if amounts:
                    amounts = [a for a in amounts if a > 0]
                if amounts:
                    if price is None:
                        price = min(amounts)
                    if mrp is None:
                        mrp = max(amounts)
        except:
            pass

        # Discount %
        try:
            discount = 0.0
            discount_el = page.query_selector("span[class*='DrugPriceBox__slashed-percent']")
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
            "pharmacy": "1mg",
            "name": name,
            "price": price,
            "mrp": mrp,
            "discount_percent": discount,
            "link": link
        }


def run_1mg_search(query):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        product_link = get_1mg_product_link_from_search(page, query)
        browser.close()
        return product_link

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "aricep 5 tablet"
    link = run_1mg_search(query)
    if link:
        data = scrape_1mg_product(link)
        print(json.dumps(data))
    else:
        print(json.dumps({"error": "Product not found", "query": query}))
        sys.exit(1)
