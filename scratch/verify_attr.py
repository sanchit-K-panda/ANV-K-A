import os
import re

react_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/react"
pattern = re.compile(r'\b(d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|transform|stroke|fill|strokeWidth|stroke-width|strokeLinecap|stroke-linecap|strokeLinejoin|stroke-linejoin|className|xmlns|viewBox|aria-hidden)"([^"\r\n]*)"')

total_matches = 0
unmatched_bad = []

for f in sorted(os.listdir(react_dir)):
    if not f.endswith('.tsx'):
        continue
    fp = os.path.join(react_dir, f)
    with open(fp, 'r', encoding='utf-8') as s:
        content = s.read()
    
    matches = pattern.findall(content)
    total_matches += len(matches)
    
    # Check if there are any other bad attributes we missed
    lines = content.splitlines()
    for line in lines:
        if '<' in line and not line.strip().startswith('//'):
            # check for any identifier directly followed by quote without =
            m = re.findall(r'(?<=\s)([a-zA-Z0-9_-]+)"([^"\r\n]*)"', line)
            for k, v in m:
                if k not in ['from', 'import']:
                    if not pattern.search(f'{k}"{v}"'):
                        unmatched_bad.append((f, k, v))

print(f"Total attributes with missing = matched: {total_matches}")
print(f"Unmatched other bad attributes: {len(unmatched_bad)}")
if unmatched_bad:
    print("Unmatched:", unmatched_bad)
