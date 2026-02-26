import re, json, os

ROOT = "/vercel/share/v0-project"

print("Starting script...")
print(f"Checking path: {os.path.join(ROOT, 'backend', 'car_catalog.py')}")
print(f"File exists: {os.path.exists(os.path.join(ROOT, 'backend', 'car_catalog.py'))}")

# List backend dir
print("Backend dir contents:")
for f in os.listdir(os.path.join(ROOT, "backend")):
    print(f"  {f}")

catalog_path = os.path.join(ROOT, "backend", "car_catalog.py")
with open(catalog_path, "r") as f:
    text = f.read()

print(f"Read {len(text)} chars from car_catalog.py")

pattern = r'\{"make":\s*[\'"]([^\'"]+)[\'"],\s*"model":\s*[\'"]([^\'"]+)[\'"],\s*"year":\s*(\d+)\}'
entries = re.findall(pattern, text)
print(f"Found {len(entries)} entries")

catalog = {}
for make, model, year in entries:
    make = make.strip()
    model = model.strip()
    yr = int(year)
    catalog.setdefault(make, {}).setdefault(model, [])
    if yr not in catalog[make][model]:
        catalog[make][model].append(yr)

sorted_catalog = {}
for make in sorted(catalog.keys()):
    sorted_catalog[make] = {}
    for model in sorted(catalog[make].keys()):
        sorted_catalog[make][model] = sorted(catalog[make][model], reverse=True)

out_dir = os.path.join(ROOT, "lib")
os.makedirs(out_dir, exist_ok=True)

out_path = os.path.join(out_dir, "car-catalog.ts")
content = "// Auto-generated from backend/car_catalog.py -- do not edit by hand\nexport const CAR_CATALOG: Record<string, Record<string, number[]>> = " + json.dumps(sorted_catalog, indent=2) + ";\n"

with open(out_path, "w") as f:
    f.write(content)

print(f"Wrote {out_path} with {len(sorted_catalog)} makes, {len(content)} chars")
print("Done!")
