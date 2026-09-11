import os
import shutil
import re
import json

src_react = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/react"
src_svg = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/svg"
src_manifest = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/manifest.json"
src_map = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/anviksa-icon-map.json"
src_theme = r"anviksa-soc-icon-pack/anviksa-soc-icon-pack/theme.css"

dest_icons = r"frontend/components/icons"
dest_public_icons = r"frontend/public/icons"
dest_lib_icons = r"frontend/lib/icons"

os.makedirs(dest_icons, exist_ok=True)
os.makedirs(dest_public_icons, exist_ok=True)
os.makedirs(dest_lib_icons, exist_ok=True)

# Copy manifest and map to public and lib
shutil.copy2(src_manifest, os.path.join(dest_public_icons, "manifest.json"))
shutil.copy2(src_map, os.path.join(dest_public_icons, "anviksa-icon-map.json"))
shutil.copy2(src_manifest, os.path.join(dest_lib_icons, "manifest.json"))
shutil.copy2(src_map, os.path.join(dest_lib_icons, "anviksa-icon-map.json"))

# Copy all 90 SVGs to frontend/public/icons
svg_files = [f for f in os.listdir(src_svg) if f.endswith('.svg')]
for f in svg_files:
    shutil.copy2(os.path.join(src_svg, f), os.path.join(dest_public_icons, f))
print(f"Copied {len(svg_files)} SVGs to {dest_public_icons}")

# Pattern for fixing missing = in attributes
pattern = re.compile(r'\b(d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|transform|stroke|fill|strokeWidth|stroke-width|strokeLinecap|stroke-linecap|strokeLinejoin|stroke-linejoin|className|xmlns|viewBox|aria-hidden)"([^"\r\n]*)"')

# Create modernized, robust SocIcon.tsx
soc_icon_code = '''import * as React from 'react';

export interface SocIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function SocIcon({
  size = 20,
  children,
  className = '',
  ...props
}: SocIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export default SocIcon;
'''

with open(os.path.join(dest_icons, "SocIcon.tsx"), "w", encoding="utf-8") as f:
    f.write(soc_icon_code)

# Process all React components from src_react
react_files = [f for f in os.listdir(src_react) if f.endswith('.tsx') and f != 'SocIcon.tsx']
fixed_count = 0
total_replacements = 0

exported_components = []

for f in sorted(react_files):
    src_path = os.path.join(src_react, f)
    with open(src_path, 'r', encoding='utf-8') as sf:
        content = sf.read()

    # Apply attribute fix
    fixed_content, n = pattern.subn(r'\1="\2"', content)
    total_replacements += n
    if n > 0:
        fixed_count += 1

    # Ensure clean imports and 'use client'
    if not fixed_content.startswith("'use client';"):
        fixed_content = "'use client';\n\n" + fixed_content

    # Normalize default export and named export
    comp_name = f[:-4]
    exported_components.append(comp_name)
    if f"export default {comp_name};" not in fixed_content:
        fixed_content += f"\nexport default {comp_name};\n"

    dest_path = os.path.join(dest_icons, f)
    with open(dest_path, "w", encoding="utf-8") as df:
        df.write(fixed_content)

print(f"Fixed {fixed_count} React files with {total_replacements} replacements.")
print(f"Written {len(react_files)} components into {dest_icons}")

# Create frontend/components/icons/index.ts
index_lines = [
    "'use client';",
    "",
    "export * from './SocIcon';",
    "export { default as SocIcon } from './SocIcon';",
    "",
]

for comp in sorted(exported_components):
    index_lines.append(f"export * from './{comp}';")
    index_lines.append(f"export {{ default as {comp} }} from './{comp}';")

index_lines.append("")
index_lines.append("// Legacy compatibility aliases")
index_lines.append("export { SocShieldCheck as SocShieldCheckLegacy } from './SocShieldCheck';")

with open(os.path.join(dest_icons, "index.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(index_lines) + "\n")

print("Created frontend/components/icons/index.ts with all exports.")
