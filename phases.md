# DiffGuard AI — Development Phases & Sprint Roadmap

## Overview
This roadmap outlines the phased implementation plan for DiffGuard AI, transitioning from low-level AST analysis to a fully realized full-stack production application.

---

## Phase 1: Foundation (Data Rules & AST Engine)
- [x] Python environment configuration with strict dependency isolation.
- [x] Pydantic v2 data models (`DiffGuardState`, `BreakingChangeItem`, `DetectedIssue`, `PatchResult`).
- [x] Core AST code scanner (`ast_parser.py`) utilizing `ast.NodeVisitor`:
  - Import statement detection and alias resolution (`import stripe as s`, `from openai import ChatCompletion`).
  - Function and method call detection with argument mapping.
  - Line number, column offset, and code context extraction.
- [x] ChromaDB / In-memory semantic vector embedding module for fuzzy symbol matching.
- [x] Unit test suite for AST analysis on typical SDK patterns (Stripe, OpenAI, Twilio).

---

## Phase 2: The AI Brain (LangGraph 4-Robot Assembly Line)
- [x] **Robot 1 (Changelog Extractor)**:
  - Ingestion of markdown changelogs, plain text, and OpenAPI specs.
  - Extraction of breaking change contracts and replacement signatures.
- [x] **Robot 2 (Code Inspector)**:
  - Cross-references extracted breaking changes with code AST nodes.
  - Generates matched issue instances with exact source citations.
- [x] **Robot 3 (Risk Assessor)**:
  - Crash severity scoring algorithm (RED / YELLOW / GREEN).
  - Human-readable root-cause explanations and blast radius estimation.
- [x] **Robot 4 (The Mechanic)**:
  - Automated code refactoring engine.
  - Ironclad AST syntax verification guardrail (`ast.parse()` validation).
  - Unified git diff generation (`difflib.unified_diff`).
- [x] Integration into a LangGraph `StateGraph` workflow with step logging and latency telemetry.

---

## Phase 3: The Visual Studio (Retro-Computer UI with React Bits)
- [x] Vite + React + TypeScript + Tailwind CSS application setup.
- [x] Cybernetic retro-computer aesthetic:
  - Midnight Slate (`#0F172A`) base, Electric Indigo (`#6366F1`) neons, CRT scanlines, terminal green/amber telemetry.
  - CRT toggle mode with phosphor glow and screen curvature styling.
- [x] React Bits component integration:
  - `DecryptedText`: Cyberpunk terminal text decryption for headings and scanner output.
  - `SpotlightCard`: Interactive mouse-tracking spotlight cards for robot status and metrics.
  - `ShinyText`: Polished metallic sheen for primary action buttons.
  - `Squares`: Dynamic cybernetic grid background with interactive neon highlights.
- [x] Split-Screen Workspace (Changelog on Left, Source Code on Right).
- [x] Real-time 4-Robot Assembly Line stepper with live glowing status indicators.
- [x] Interactive Diff Studio (side-by-side or unified view with syntax highlighting).
- [x] One-click "Apply Patch" and "Export .diff" download features.

---

## Phase 4: Multi-File Scanning & Production Hardening
- [x] Project repository directory scanner (multi-file AST analysis).
- [x] Real-world migration presets:
  - Preset 1: Stripe API v2020 (`stripe.Charge.create` -> `stripe.PaymentIntent.create`).
  - Preset 2: OpenAI SDK v0.28 to v1.0.0 (`openai.ChatCompletion.create` -> `client.chat.completions.create`).
  - Preset 3: FastAPI / Pydantic v1 to v2 (`.dict()` -> `.model_dump()`, `@validator` -> `@field_validator`).
- [x] Comprehensive test suite:
  - Pytest suite covering AST, agent nodes, and FastAPI endpoints.
  - Frontend Vitest suite for UI components.
  - Build verification (`npm run build` & Python type/syntax tests).
- [x] Creation of comprehensive `APPLICATION_DOCUMENTATION.md`.
- [x] Git repository commit history tracking milestones on branch `main`.
