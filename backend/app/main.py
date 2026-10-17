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

# Include API Router
app.include_router(router)

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
