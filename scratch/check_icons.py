import os
import re

react_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/react"
svg_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/svg"

print(f"Checking {react_dir}...")
react_files = [f for f in os.listdir(react_dir) if f.endswith('.tsx')]
print(f"Total TSX files: {len(react_files)}")

issues = []
for f in react_files:
    path = os.path.join(react_dir, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    # Check for missing = in attributes, like d"..." or cx"..." or x"..."
    matches = re.findall(r'<[a-zA-Z0-9]+\s+([^>]+)>', content)
    for m in matches:
        bad = re.findall(r'\b([a-zA-Z0-9_-]+)"([^"]*)"', m)
        if bad:
            issues.append((f, bad))

print(f"Files with attribute issues: {len(issues)}")
for f, bad in issues[:10]:
    print(f, bad)
