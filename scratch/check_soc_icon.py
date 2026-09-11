import re

with open('anviksa-soc-icon-pack/anviksa-soc-icon-pack/react/SocIcon.tsx', 'r', encoding='utf-8') as fp:
    c = fp.read()

for m in re.finditer(r'(\b[a-zA-Z0-9_-]+)"([^"]*)"', c):
    print("Match:", repr(m.group(0)))
