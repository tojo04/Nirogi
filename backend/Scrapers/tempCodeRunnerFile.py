                price_el = page.query_selector("div[id='PDP price banner'] p.tD")
                price_text = price_el.inner_text().strip().replace("₹", "").replace(",", "") if price_el else None
                price_val = float(price_text) if price_text else None