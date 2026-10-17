# DiffGuard AI — UI & Theme Design Specification

## 1. Aesthetic Identity: Retro-Futuristic Terminal & Cybernetic Modernism
DiffGuard AI merges the nostalgic, high-tactility aesthetic of vintage computer terminals (DEC VT100, Commodore, Silicon Graphics workstations) with the razor-sharp information density and ergonomics of modern developer developer tools (VS Code, Linear, Cursor).

---

## 2. Color Palette & Design Tokens

### 2.1 Core Surfaces & Backgrounds
- **Primary Background (Midnight Slate)**: `#0F172A` (deep dark slate, minimizing eye fatigue)
- **Secondary Panel / Surface**: `#1E293B` (slate-800, distinct panel contrast)
- **Elevated Card Background**: `#182234`
- **Subtle Surface Border**: `#334155` (slate-700)
- **Active / Accent Border**: `#6366F1` (Electric Indigo)

### 2.2 Neon Accents & Robot Status
- **Electric Indigo**: `#6366F1` (Accent, brand highlight, active stepper)
- **Phosphor Cyber Green**: `#10B981` / `#059669` (Active success, safe diff lines, Robot online)
- **Amber Warning**: `#F59E0B` (Deprecation alerts, non-fatal issues, warning status)
- **Neon Crimson (Crash Red)**: `#EF4444` (Removed APIs, fatal crashes, removed diff lines)
- **Cyan Terminal Telemetry**: `#06B6D4` (AST nodes, parser metrics, line numbers)

### 2.3 Diff Syntax Colors (High Contrast)
- **Diff Addition Background**: `rgba(16, 185, 129, 0.15)`
- **Diff Addition Text**: `#34D399`
- **Diff Addition Border**: `#059669`
- **Diff Deletion Background**: `rgba(239, 68, 68, 0.15)`
- **Diff Deletion Text**: `#F87171`
- **Diff Deletion Border**: `#DC2626`

---

## 3. Typography System
- **Headings & Display**: Space Grotesk / Inter (`font-sans`) paired with JetBrains Mono / Fira Code.
- **Code & Telemetry**: Monospaced font (`font-mono`: "JetBrains Mono", "Fira Code", monospace).
- **Hacker Scramble Effect**: Decrypted text animations for headers, status changes, and telemetry streams.

---

## 4. Retro Display Effects (CRT Simulation)
- **Scanlines Overlay**: CSS linear gradient repeating pattern creating authentic scanlines.
- **Phosphor Glow**: Subtle `text-shadow: 0 0 8px rgba(99, 102, 241, 0.5)` on active robot indicators.
- **Vignette / Curved Screen (Toggleable CRT Mode)**: Radial gradient darkening at viewport corners for authentic retro terminal feel.
- **Motion Reduction**: Respects `prefers-reduced-motion: reduce` by disabling scanline pulse and text jitter.

---

## 5. React Bits Components Integrated
1. **`DecryptedText`** (`reactbits.dev` text animation)
   - Decrypts text glyph by glyph with configurable scramble speed and character sets.
   - Used in: Main header title, Robot status updates, and scan completion badges.
2. **`SpotlightCard`** (`reactbits.dev` component)
   - Follows mouse cursor with dynamic radial spotlight gradient sheen.
   - Used in: 4-Robot assembly cards, Risk score metrics, and AST analysis nodes.
3. **`ShinyText`** (`reactbits.dev` text animation)
   - Smooth metallic light sheen passing across text.
   - Used in: "Run 4-Robot Simulation" primary CTA and "Apply Patch" buttons.
4. **`Squares`** (`reactbits.dev` background)
   - Cybernetic grid background reacting with drifting subtle neon lighting.
   - Used in: Application backdrop and empty workspace states.

---

## 6. Layout & Information Hierarchy
- **Top Bar**: Retro brand logo, status indicators (AST Ready, Backend Online, Git Clean), CRT Effect toggle switch, preset scenario picker.
- **Workspace Panel (Split-Screen)**:
  - Left pane: Changelog / Release Notes input with markdown preview tab.
  - Right pane: Target Source Code input or Multi-File Explorer.
- **Assembly Line Stepper**: Horizontal 4-step pipeline showing Robot 1 -> Robot 2 -> Robot 3 -> Robot 4 with live state, execution time, and step logs.
- **Analysis & Patch Studio**:
  - Risk breakdown (Traffic light RED / YELLOW / GREEN badges, crash probability).
  - Code diff viewer with unified and side-by-side tabs.
  - Patch actions: "Copy Diff", "Download .diff", "Apply Fix Directly".
