# DiffGuard AI — Engineering Rules & Guardrails

## 1. Zero Hallucination Policy
- **Ground Truth Ingestion**: Breaking API changes must strictly originate from the provided release notes, OpenAPI specs, or verified migration rules. The system must never invent deprecations, renamed arguments, or non-existent replacement endpoints.
- **Source Code Integrity**: All suggested refactors must preserve the user's business logic, variable names, surrounding comments, and docstrings. Only the specific deprecated API call sites and their necessary imports may be modified.

---

## 2. AST Syntax Verification Guardrail (Ironclad Constraint)
- **Mandatory Pre-Return AST Check**: No patch, diff, or refactored code may be returned to the client or written to disk unless it passes `ast.parse(patched_code)`.
- If a generated patch yields a `SyntaxError`:
  1. The error must be caught immediately by the engine.
  2. The patch must either be regenerated/corrected or flagged with `is_ast_valid: false` along with the exact line and error details.
  3. Under no circumstances may an invalid Python syntax string be marked as a valid resolution.

---

## 3. Pydantic v2 Schema Enforcement
- All data flowing between LangGraph agent nodes must be validated through strict Pydantic v2 schemas (`BaseModel`).
- Use typed fields, explicit defaults, and validation methods.
- No untyped dictionaries or loose JSON payloads allowed across agent boundaries.

---

## 4. Traffic Light Risk Classification Criteria
- **RED (Critical Risk)**:
  - Methods or endpoints removed from the library entirely.
  - Required parameters removed or renamed without default values.
  - Changes that will trigger `AttributeError`, `TypeError`, or unhandled HTTP 404/400 at runtime.
- **YELLOW (Warning)**:
  - Methods marked as deprecated but still functional in the current minor version.
  - Parameter defaults changed or behavioral shifts (e.g. sync changed to async).
  - Deprecation warnings emitted to standard error.
- **GREEN (Safe / Low Risk)**:
  - Cosmetic renamings with active backwards-compatible aliases.
  - Optional new parameters added that don't alter existing call behavior.
  - Performance improvements or internal dependency updates.

---

## 5. Security & Privacy Rules
- **Local-First Execution**: In default local mode, code never leaves the host machine. Semantic vector matching and AST parsing execute locally.
- **Secret Masking**: Sensitive keys (e.g., Stripe `sk_live_...`, OpenAI `sk-...`) detected in code must be sanitized/redacted in logs and telemetry.
- **Non-Destructive File Operations**: Code updates require explicit user confirmation ("Apply Patch") and always generate `.diff` backups.

---

## 6. Code Style & Quality Standards
- **Backend**: Python 3.10+ compatible, PEP 8, strict type hints (`typing`), asynchronous endpoints (`async def`), comprehensive pytest coverage.
- **Frontend**: TypeScript strict mode, clean modular component hierarchy, no unused imports, responsive desktop & mobile layouts, full keyboard accessibility.
