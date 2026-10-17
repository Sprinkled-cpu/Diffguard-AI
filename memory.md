# DiffGuard AI — Project Living Memory & ADR Log

## 1. Project Identity & Status
- **Project**: DiffGuard AI — The Digital Mechanic for Broken Software Integrations
- **Workspace**: `D:\production projects\diffguard-ai`
- **Branch**: `main`
- **Status**: Active Implementation (Sprint Week 1 - 4 Comprehensive Rollout)

---

## 2. Completed Milestones
- [x] Initialized Git repository on `main` branch.
- [x] Created root `.gitignore` covering Python, Node, Vite, ChromaDB, and secrets.
- [x] Python 3.13 virtual environment established (`venv`).
- [x] Authored 5 core blueprint files: `PRD.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`.

---

## 3. Architecture Decision Records (ADRs)

### ADR 001: Hybrid Backend Architecture (FastAPI + LangGraph + Native AST)
- **Context**: The PDF blueprint mentions LangGraph and Streamlit, but also specifies strict AST parsing, Pydantic v2 validation, and the prompt requires a production-grade full-stack responsive application with React Bits.
- **Decision**: Build the AI engine with LangGraph StateGraph design pattern in Python using FastAPI for high-performance REST APIs and real-time streaming, while building a full React + Vite + TypeScript frontend.
- **Consequences**: Provides sub-millisecond AST parsing, 100% reliable local fallback mode, seamless integration with React Bits animated components, and enterprise API testability.

### ADR 002: Dual-Mode Intelligence (Real AI + Deterministic Local AST Engine)
- **Context**: Users and CI environments may run with or without external LLM API keys (Gemini / OpenAI).
- **Decision**: Implement a dual-mode engine. When an API key is provided, the agent leverages advanced LLM inference; when in local mode, it leverages native Python `ast.NodeVisitor`, regex symbol extractors, and in-memory cosine vector similarity.
- **Consequences**: Zero single point of failure. The application and test suites pass 100% offline, while seamlessly scaling to frontier LLMs when keys are provided.

### ADR 003: Ironclad AST Syntax Verification
- **Context**: LLM-generated code patches frequently suffer from minor syntax regressions (missing colons, mismatched indentations).
- **Decision**: Robot 4 (Patch Generator) must compile every candidate refactor through `ast.parse()`. If syntax validation fails, the patch is rejected or corrected before reaching the user.
- **Consequences**: Guarantees that any patch presented or applied will never crash the user's Python interpreter with a syntax error.

---

## 4. Current Task & Next Steps
- [ ] Install backend dependencies (FastAPI, uvicorn, pydantic, chromadb/vector engine, pytest, httpx).
- [ ] Implement backend models (`state.py`, `schemas.py`).
- [ ] Implement AST parser (`ast_parser.py`) and patch engine (`patch_engine.py`).
- [ ] Implement 4-robot LangGraph assembly line (`langgraph_assembly.py`).
- [ ] Implement FastAPI server endpoints and migration presets (`main.py`, `router.py`, `presets.py`).
- [ ] Setup frontend (React + Vite + TypeScript + Tailwind CSS).
- [ ] Implement React Bits components (`DecryptedText`, `SpotlightCard`, `ShinyText`, `Squares`).
- [ ] Build UI views (Split Workspace, Live Assembly Stepper, Diff Studio, Repo Scanner).
- [ ] Execute test suites (Backend pytest, Frontend Vitest/tests, Build checks).
- [ ] Generate comprehensive `APPLICATION_DOCUMENTATION.md` and commit to Git.
