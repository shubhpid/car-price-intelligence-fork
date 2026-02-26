import re, json, os

# Scripts are executed from /home/user so we use the scripts dir directly
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()

# Try multiple possible locations
possible_paths = [
    os.path.join(os.getcwd(), "car_catalog.py"),
    "/home/user/car_catalog.py",
]

# Also list current directory to debug
print(f"CWD: {os.getcwd()}")
print(f"CWD contents: {os.listdir(os.getcwd())}")

catalog_path = None
for p in possible_paths:
    if os.path.exists(p):
        catalog_path = p
        print(f"Found catalog at: {p}")
        break

if not catalog_path:
    # Try to find it anywhere accessible
    for root, dirs, files in os.walk(os.getcwd()):
        for f in files:
            if f == "car_catalog.py":
                catalog_path = os.path.join(root, f)
                print(f"Found catalog at: {catalog_path}")
                break
        if catalog_path:
            break

if not catalog_path:
    print("ERROR: Could not find car_catalog.py")
    exit(1)

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

# Write to lib directory - try /vercel/share/v0-project/lib first
out_dir = "/vercel/share/v0-project/lib"
if not os.path.exists("/vercel/share/v0-project"):
    out_dir = os.path.join(os.getcwd(), "lib")

os.makedirs(out_dir, exist_ok=True)

out_path = os.path.join(out_dir, "car-catalog.ts")
content = "// Auto-generated from backend/car_catalog.py -- do not edit by hand\nexport const CAR_CATALOG: Record<string, Record<string, number[]>> = " + json.dumps(sorted_catalog, indent=2) + ";\n"

with open(out_path, "w") as f:
    f.write(content)

print(f"Wrote {out_path} with {len(sorted_catalog)} makes, {len(content)} chars")
print("Done!")
