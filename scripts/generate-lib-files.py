"""Parse backend/car_catalog.py and generate lib/car-catalog.ts as a
   Record<string, Record<string, number[]>> (make -> model -> years)."""

import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── 1. Parse car_catalog.py ──────────────────────────────────────────────────
catalog_path = os.path.join(ROOT, "backend", "car_catalog.py")
with open(catalog_path, "r") as f:
    text = f.read()

# Each entry looks like: {"make": 'acura', "model": 'ilx', "year": 2020}
pattern = r'\{"make":\s*[\'"]([^\'"]+)[\'"],\s*"model":\s*[\'"]([^\'"]+)[\'"],\s*"year":\s*(\d+)\}'
entries = re.findall(pattern, text)

# Build nested dict: make -> model -> sorted years
catalog = {}
for make, model, year in entries:
    make = make.strip()
    model = model.strip()
    yr = int(year)
    catalog.setdefault(make, {}).setdefault(model, [])
    if yr not in catalog[make][model]:
        catalog[make][model].append(yr)

# Sort years descending for each model, sort models, sort makes
sorted_catalog = {}
for make in sorted(catalog.keys()):
    sorted_catalog[make] = {}
    for model in sorted(catalog[make].keys()):
        sorted_catalog[make][model] = sorted(catalog[make][model], reverse=True)

# Write lib/car-catalog.ts
out_path = os.path.join(ROOT, "lib", "car-catalog.ts")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w") as f:
    f.write("// Auto-generated from backend/car_catalog.py -- do not edit by hand\n")
    f.write("export const CAR_CATALOG: Record<string, Record<string, number[]>> = ")
    f.write(json.dumps(sorted_catalog, indent=2))
    f.write(";\n")

print(f"Wrote {out_path} with {len(sorted_catalog)} makes")

# ── 2. Parse backend us_state_data if exists, otherwise create stub ──────────
# Check if the market page needs US_STATE_DATA
us_map_path = os.path.join(ROOT, "backend", "us_state_data.py")
us_map_out = os.path.join(ROOT, "lib", "us-map-data.ts")

# Try to find the data from the backend
found_us_data = False
for fname in os.listdir(os.path.join(ROOT, "backend")):
    fpath = os.path.join(ROOT, "backend", fname)
    if not os.path.isfile(fpath):
        continue
    with open(fpath, "r") as f:
        content = f.read()
    if "US_STATE_DATA" in content or "us_state_data" in content:
        print(f"Found US state data reference in backend/{fname}")
        found_us_data = True
        # Extract the data
        match = re.search(r'US_STATE_DATA\s*[:=]\s*(\{.+?\})\s*$', content, re.DOTALL | re.MULTILINE)
        if match:
            print("Extracted US_STATE_DATA from backend")

# If not found in backend, check the main.py for the data structure
main_path = os.path.join(ROOT, "backend", "main.py")
if os.path.isfile(main_path):
    with open(main_path, "r") as f:
        main_text = f.read()
    if "state_market_data" in main_text or "US_STATE" in main_text:
        print("Found state market data references in main.py")

print("Done!")
