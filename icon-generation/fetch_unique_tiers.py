from bs4 import BeautifulSoup
import re
import json
import requests


def parse_tier_value(tier_text):
    if not tier_text or tier_text.strip() in ['—', '']:
        return None
    
    # Remove superscript tags and extract just the numbers/hyphens
    tier_text = re.sub(r'<sup>.*?</sup>', '', tier_text)
    tier_text = tier_text.strip()
    
    if tier_text in ['—', '']:
        return None
    
    # Try to parse as integer
    try:
        return int(tier_text)
    except ValueError:
        # Can't parse as int (e.g., "2-3", "0-F", etc.)
        return None


def extract_item_name(td_element):
    # Try to find the <a> tag with the item name
    link = td_element.find('a')
    if link:
        # Use the text content of the link (visible name)
        return link.get_text(strip=True)
    
    # Fallback: just get the text content
    return td_element.get_text(strip=True)


def parse_unique_tiers(source):
    # Check if source is a URL or file path
    if source.startswith('http://') or source.startswith('https://'):
        print(f"Fetching content from URL: {source}")
        response = requests.get(source)
        response.raise_for_status()
        html_content = response.text
    else:
        print(f"Reading from file: {source}")
        with open(source, 'r', encoding='utf-8') as f:
            html_content = f.read()
    
    # The HTML file might be a fragment, so parse it directly
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all tables - prefer 'sortable' tables (from live wiki) or all tables (from file)
    tables = soup.find_all('table', class_='sortable')
    if not tables:
        tables = soup.find_all('table')
    
    if not tables:
        print("No tables found in HTML")
        return {}
    
    print(f"Found {len(tables)} total tables in the document")
    
    results = {}
    tables_parsed = 0
    
    # Process each table
    for table_idx, table in enumerate(tables):
        # Check if this table has "Unique" as the first header
        thead = table.find('thead')
        headers = []
        
        if thead:
            headers = thead.find_all('th')
        else:
            # Headers might be in the first tr
            first_row = table.find('tr')
            if first_row:
                headers = first_row.find_all('th')
        
        if not headers or headers[0].get_text(strip=True) != "Unique":
            continue
        
        # This is a table we want to parse
        tables_parsed += 1
        print(f"\nTable {tables_parsed}:")
        
        # Get the caption if available
        caption = table.find('caption')
        if caption:
            print(f"  Category: {caption.get_text(strip=True)}")
        
        print(f"  Found {len(headers)} columns")
        for i, header in enumerate(headers):
            print(f"    Column {i}: {header.get_text(strip=True)}")
    
        # Parse the table body
        tbody = table.find('tbody')
        if not tbody:
            print("  No tbody found, skipping")
            continue
        
        rows = tbody.find_all('tr')
        items_in_table = 0
        
        for row in rows:
            cells = row.find_all('td')
            
            if len(cells) < 2:
                continue
            
            # First cell contains the item name
            item_name = extract_item_name(cells[0])
            
            # Get the tier from the last data cell (not Notes)
            # Strategy: take second-to-last cell if there are many cells (assuming last is Notes),
            # otherwise take the last cell
            latest_tier = None
            if len(cells) >= 3:
                # Try second-to-last cell first (likely the tier column before Notes)
                tier_cell = cells[-2]
                tier_html = ''.join(str(content) for content in tier_cell.contents)
                latest_tier = parse_tier_value(tier_html)
                
                # If that didn't work, try the last cell
                if latest_tier is None and len(cells) >= 2:
                    tier_cell = cells[-1]
                    tier_html = ''.join(str(content) for content in tier_cell.contents)
                    latest_tier = parse_tier_value(tier_html)
            elif len(cells) >= 2:
                # Only 2 cells: name and tier
                tier_cell = cells[-1]
                tier_html = ''.join(str(content) for content in tier_cell.contents)
                latest_tier = parse_tier_value(tier_html)
            
            if item_name:
                results[item_name] = latest_tier
                items_in_table += 1
    return results


def main():
    source = 'https://www.poewiki.net/wiki/Guide:Analysis_of_unique_item_tiers'
    unique_tiers = parse_unique_tiers(source)
    output_file = 'public/assets/poe1/items/unique_tiers.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({k:v for k,v in unique_tiers.items() if v is not None}, f, ensure_ascii=False, separators=(',', ':'))
    

if __name__ == '__main__':
    main()
