"""Vercel Serverless Function entrypoint for DiffGuard AI FastAPI Backend."""
import sys
from pathlib import Path

# Add backend directory to sys.path so app imports resolve seamlessly
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
