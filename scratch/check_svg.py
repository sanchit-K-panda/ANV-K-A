import os
import re

svg_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/svg"
svg_files = [f for f in os.listdir(svg_dir) if f.endswith('.svg')]
print(f"Total SVG files: {len(svg_files)}")

svg_issues = []
for f in svg_files:
    path = os.path.join(svg_dir, f)
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    bad = re.findall(r'\b([a-zA-Z0-9_-]+)"([^"]*)"', content)
    if bad:
        svg_issues.append((f, bad))

print(f"SVG files with missing =: {len(svg_issues)}")
if svg_issues:
    print(svg_issues[:5])
else:
    print("All SVGs are valid or check first SVG content:")
    with open(os.path.join(svg_dir, svg_files[0]), 'r', encoding='utf-8') as fp:
        print(fp.read())
