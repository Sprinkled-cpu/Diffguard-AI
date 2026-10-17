# DiffGuard AI — Product Requirements Document (PRD)

## 1. Executive Summary & Vision
**DiffGuard AI** is the "Digital Mechanic for Broken Software Integrations". Modern web applications rely on dozens of third-party SDKs and cloud APIs (e.g., Stripe, Twilio, OpenAI, AWS, Supabase, SendGrid). Upstream providers constantly release breaking changes—deprecating methods, modifying required parameter schemas, altering return types, or completely retiring endpoints.

When this occurs, development teams face extensive downtime and technical debt, spending dozens of hours reading changelogs, searching repositories line-by-line, and manually refactoring code. DiffGuard AI provides a production-grade, 4-robot LangGraph-powered assembly line that:
1. Automatically ingests unstructured changelogs, release notes, or OpenAPI specifications.
2. Extracts structured breaking API definitions using Pydantic v2.
3. Performs rigorous Abstract Syntax Tree (AST) scanning coupled with vector embeddings to locate affected code across single or multi-file repositories.
4. Assesses runtime crash impact using a deterministic traffic-light risk rating (RED, YELLOW, GREEN).
5. Generates AST-verified patch suggestions and unified git diffs (`diff -u`) with one-click fix capabilities.

---

## 2. Target Personas
- **Full-Stack / Backend Engineers**: Need to safely upgrade critical payment, AI, or cloud SDKs without breaking customer-facing flows.
- **DevOps / Platform Engineers**: Want automated CI/CD checks to prevent merging outdated third-party API invocations.
- **Engineering Managers & Tech Leads**: Seek visibility into blast radius, regression risks, and technical debt prior to major dependency bumps.
- **Open-Source Maintainers**: Need rapid generation of migration guides and diffs for breaking library releases.

---

## 3. Functional Requirements

### 3.1 Robot 1: The Fast Reader (Changelog Extractor)
- **Input**: Raw text, Markdown release notes, or OpenAPI (JSON/YAML) definitions.
- **Output**: Validated Pydantic v2 `ChangelogReport` containing:
  - Library name and version transition (e.g., `openai 0.28 -> 1.0.0`).
  - List of `BreakingChangeItem` entities:
    - Target symbol/method name (e.g., `openai.ChatCompletion.create`).
    - Change type (`deprecated`, `removed`, `signature_changed`, `renamed`, `type_changed`).
    - Old signature and new signature.
    - Parameter mutations (renamed, required, removed).
    - Severity rating and clear migration instruction.

### 3.2 Robot 2: The Inspector (Code Scanner)
- **Input**: User Python source code (single snippet or multi-file repository directory) + extracted breaking changes.
- **Engine**:
  - Python native `ast` (Abstract Syntax Tree) visitor analyzing:
    - Module imports (`import stripe`, `from openai import ChatCompletion`).
    - Call expressions (`stripe.Charge.create(...)`).
    - Attribute lookups and class instantiations.
    - Keyword argument mutations (e.g., `model="gpt-3.5-turbo"`).
  - Semantic vector similarity matching (ChromaDB vector collection with fallback cosine similarity) for natural-language descriptions to code symbols.
- **Output**: List of `DetectedIssue` items with exact line numbers, column offsets, code context, matched breaking change, and AST node types.

### 3.3 Robot 3: The Risk Assessor (Impact Evaluator)
- **Engine**: Evaluates runtime blast radius based on call site depth, presence of error handlers (`try/except`), and breaking change type.
- **Severity Classification**:
  - **RED (Critical)**: Crash on execution (e.g., removed endpoint, removed required argument without default, changed return object structure without backward compatibility).
  - **YELLOW (Warning)**: Deprecation warning emitted, subtle behavioral alteration, or performance degradation.
  - **GREEN (Safe / Info)**: Optional parameter change, backwards-compatible alias, or internal optimization.
- **Output**: Overall Risk Score (0-100), Traffic Light status, root-cause explanation, and runtime failure forecast.

### 3.4 Robot 4: The Mechanic (Patch Generator)
- **Engine**:
  - Synthesizes refactored code matching new API specifications.
  - **AST Syntax Verification Guardrail**: Patched code MUST pass `ast.parse()` validation before presentation to the user. Zero invalid syntax diffs permitted.
  - Generates unified git diff format (`--- a/file.py`, `+++ b/file.py`, `@@ ... @@`).
- **User Actions**:
  - Interactive side-by-side / split diff preview.
  - "Apply Fix" button modifying the source file or staging memory.
  - "Export .diff" download button for patch distribution.

### 3.5 Multi-File & Project Repository Scanning
- Scan entire project directories, skipping ignored paths (`venv`, `.git`, `node_modules`).
- Summary matrix of affected files, total breaking calls, and batch patch generation.

---

## 4. Non-Functional Requirements (NFRs)
- **Correctness & Reliability**: 100% of generated patches must pass AST parsing. Zero hallucinated API signatures.
- **Performance**: Single file scan (< 500 lines) completes in under 2 seconds in local mode.
- **Security & Privacy**: Zero transmission of user code to external servers when using local mode. API keys kept in-memory or environment variables.
- **Usability & Aesthetic**: Retro-computer-inspired dark UI with terminal scanlines, neon accents, high-contrast diff syntax, and responsive layout.
- **Testability**: Comprehensive automated test suite covering unit tests, AST parsers, API endpoints, agent state transitions, and UI components.
