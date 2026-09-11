import os
import re

react_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/react"

for f in sorted(os.listdir(react_dir)):
    if not f.endswith('.tsx'):
        continue
    fp = os.path.join(react_dir, f)
    with open(fp, 'r', encoding='utf-8') as s:
        content = s.read()
    
    # Match whitespace + attribute_name + '"' (meaning no '=' after attribute name)
    # But only inside JSX tags!
    # Notice: attr="value" has '=' between attr and quote, so it does NOT match!
    # attr"value" has NO '=' between attr and quote, so it DOES match!
    # We must ensure we don't match something like import ... from "..."
    # Inside JSX tag, attributes are like: <tag attr"value"> or <tag\n attr"value"
    matches = re.findall(r'(?<=\s)([a-zA-Z][a-zA-Z0-9_-]*)"([^"\r\n]*)"', content)
    if matches:
        # Filter out from "react", etc.
        bad_attrs = [m for m in matches if m[0] not in ('from', 'import')]
        if bad_attrs:
            print(f"{f}: {bad_attrs}")
