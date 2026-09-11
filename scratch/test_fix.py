import os
import re

react_dir = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/react"
files_fixed = 0
total_replacements = 0

for f in os.listdir(react_dir):
    if not f.endswith('.tsx'):
        continue
    fp = os.path.join(react_dir, f)
    with open(fp, 'r', encoding='utf-8') as s:
        content = s.read()
    
    # regex: find an attribute name followed directly by quote without '='
    # e.g. cx"9" -> cx="9", d"M..." -> d="M..."
    # Note: don't match something that already has =
    fixed_content, count = re.subn(r'(\b[a-zA-Z0-9_-]+)"([^"]*)"', r'\1="\2"', content)
    # Wait, what if it was already attr="val"?
    # In regex (\b[a-zA-Z0-9_-]+)" will NOT match = because [a-zA-Z0-9_-] doesn't include '='!
    # But in attr="val", \b[a-zA-Z0-9_-]+ matches 'attr', and the next character in string is '=', NOT '"'!
    # So (\b[a-zA-Z0-9_-]+)" only matches when there is NO '=' between the identifier and '"'!
    if count > 0:
        files_fixed += 1
        total_replacements += count
        print(f"File {f}: {count} replacements")

print(f"\nTotal files needing fix: {files_fixed}, total replacements: {total_replacements}")
