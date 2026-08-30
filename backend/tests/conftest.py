"""Pytest configuration ensuring workspace root and backend paths are in sys.path."""
from __future__ import annotations

import sys
from pathlib import Path

# Add backend and workspace root to sys.path
backend_root = Path(__file__).resolve().parent.parent
workspace_root = backend_root.parent

for p in [str(workspace_root), str(backend_root)]:
    if p not in sys.path:
        sys.path.insert(0, p)
