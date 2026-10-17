"""Vercel Serverless Function entrypoint for DiffGuard AI FastAPI Backend."""
import sys
from pathlib import Path

# Add backend directory to sys.path so app imports resolve seamlessly
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import Request
from app.main import app

@app.middleware("http")
async def vercel_path_rewrite_middleware(request: Request, call_next):
    # When Vercel rewrites to /api/index.py, original requested path is in 'x-matched-path' or 'x-forwarded-uri'
    matched_path = request.headers.get("x-matched-path")
    if matched_path and request.scope["path"] == "/api/index.py":
        request.scope["path"] = matched_path
    return await call_next(request)

@app.get("/api/index.py")
def debug_vercel(request: Request):
    return {
        "matched_path": request.headers.get("x-matched-path"),
        "headers": dict(request.headers),
        "scope_path": request.scope.get("path")
    }
