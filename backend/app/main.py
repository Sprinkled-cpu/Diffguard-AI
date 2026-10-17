"""DiffGuard AI — Main FastAPI Application Entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import router

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="The Digital Mechanic for Broken Software Integrations — LangGraph 4-Robot Assembly Line & AST Guardrail Engine"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router (both with /api prefix and direct for Vercel serverless rewrites)
app.include_router(router)

from fastapi import APIRouter
from app.api.router import (
    health_check,
    get_presets,
    get_preset,
    run_pipeline,
    scan_repository,
    export_patch_file,
)
bare_router = APIRouter()
bare_router.add_api_route("/health", health_check, methods=["GET"])
bare_router.add_api_route("/presets", get_presets, methods=["GET"])
bare_router.add_api_route("/presets/{preset_id}", get_preset, methods=["GET"])
bare_router.add_api_route("/pipeline/run", run_pipeline, methods=["POST"])
bare_router.add_api_route("/repo/scan", scan_repository, methods=["POST"])
bare_router.add_api_route("/patch/export", export_patch_file, methods=["POST"])
app.include_router(bare_router)

@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.version,
        "status": "online",
        "docs_url": "/docs",
        "description": "LangGraph 4-Robot AI Engine for automated breaking API changelog refactoring"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
