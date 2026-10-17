# DiffGuard AI
> **The Digital Mechanic for Broken Software Integrations**

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://diffguard-ai.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.2-purple.svg)](https://vitejs.dev)
[![AST Guardrail](https://img.shields.io/badge/AST%20Guardrail-100%25%20Verified-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/Tests-29%20Passed-success.svg)]()

> **Live Production URL**: [https://diffguard-ai.vercel.app](https://diffguard-ai.vercel.app)  
> **Vercel Dashboard**: [https://vercel.com/aditya-deeps-projects/diffguard-ai](https://vercel.com/aditya-deeps-projects/diffguard-ai)

DiffGuard AI solves one of modern software engineering's biggest headaches: **breaking third-party API deprecations**. When providers like Stripe, OpenAI, or Twilio release breaking changes, DiffGuard AI deploys a 4-robot LangGraph assembly line to ingest changelogs, scan user codebases with Python native AST, evaluate crash risk (RED / YELLOW / GREEN), and generate AST-validated code patches with unified git diffs.

---

## ⚡ 4-Robot Assembly Line
1. **Robot 1: The Fast Reader (Changelog Extractor)** — Ingests release notes & OpenAPI specs, emits validated Pydantic v2 breaking change models.
2. **Robot 2: The Inspector (AST Code Scanner)** — Scans user code using Python's native `ast` visitor to locate broken call sites, imports, and parameter mutations.
3. **Robot 3: The Risk Assessor (Impact Evaluator)** — Rates crash blast radius using a traffic-light indicator (RED / YELLOW / GREEN) and 0-100 score.
4. **Robot 4: The Mechanic (Patch Generator & AST Guardrail)** — Generates refactored code and unified git diffs, strictly verifying 100% syntax compliance via `ast.parse()`.

---

## 🕹️ Retro-Computer UI & React Bits
- **CRT Monitor Experience**: Toggleable scanlines, phosphor glow, and screen vignette.
- **`DecryptedText`** (`reactbits.dev`): Cyberpunk text decryption animations.
- **`SpotlightCard`** (`reactbits.dev`): Mouse-following radial glow cards.
- **`ShinyText`** (`reactbits.dev`): Sweeping metallic sheen on action CTAs.
- **`Squares`** (`reactbits.dev`): Interactive drifting cybernetic grid background.

---

## 🚀 Quick Start

### 1. Launch with PowerShell
```powershell
.\start.ps1
```

### 2. Manual Startup
**Backend**:
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn app.main:app --app-dir backend --port 8000 --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## 🧪 Testing
- **Backend (Pytest)**:
  ```powershell
  $env:PYTHONPATH="backend"
  .\venv\Scripts\pytest backend\tests -v
  # 22 passed in 2.90s
  ```
- **Frontend (Vitest)**:
  ```powershell
  cd frontend
  npm test
  # 7 passed in 0.70s
  ```
- **Production Build**:
  ```powershell
  cd frontend
  npm run build
  # 1498 modules transformed, 0 errors
  ```

---

## 📚 Documentation
Comprehensive technical documentation is available in [`APPLICATION_DOCUMENTATION.md`](./APPLICATION_DOCUMENTATION.md).
Architectural blueprints:
- [`PRD.md`](./PRD.md)
- [`architecture.md`](./architecture.md)
- [`rules.md`](./rules.md)
- [`phases.md`](./phases.md)
- [`design.md`](./design.md)
- [`memory.md`](./memory.md)
