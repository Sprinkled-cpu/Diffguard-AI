"""FastAPI Router for DiffGuard AI API endpoints."""
import os
import time
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from app.models.schemas import (
    PipelineRunRequest,
    PipelineRunResponse,
    SingleStepRequest,
    PresetScenario,
    RepoScanRequest,
    RepoScanResponse,
    FileScanResult,
    PatchResult,
)
from app.models.state import DiffGuardState
from app.engine.langgraph_assembly import (
    LangGraphAssemblyLine,
    ChangelogExtractor,
    ImpactEvaluator,
)
from app.engine.ast_parser import CodeScanner
from app.engine.patch_engine import PatchEngine
from app.api.presets import PRESET_SCENARIOS

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    """Health and engine status endpoint."""
    return {
        "status": "healthy",
        "service": "DiffGuard AI Engine",
        "version": "1.0.0",
        "ast_engine": "Native Python 3.13 AST (Active)",
        "guardrail": "ast.parse() validation enforced",
        "timestamp": time.time()
    }

@router.get("/presets", response_model=List[PresetScenario])
def get_presets():
    """Returns curated real-world SDK migration presets."""
    return PRESET_SCENARIOS

@router.get("/presets/{preset_id}", response_model=PresetScenario)
def get_preset(preset_id: str):
    """Returns details for a single preset scenario."""
    for p in PRESET_SCENARIOS:
        if p.id == preset_id:
            return p
    raise HTTPException(status_code=404, detail="Preset scenario not found")

@router.post("/pipeline/run", response_model=PipelineRunResponse)
def run_pipeline(request: PipelineRunRequest):
    """Executes the complete 4-Robot LangGraph assembly line."""
    initial_state = DiffGuardState(
        raw_changelog=request.changelog_text,
        source_code=request.source_code,
        file_path=request.file_path or "main.py",
        use_llm=request.use_llm,
        api_key=request.api_key
    )

    final_state = LangGraphAssemblyLine.run_assembly_line(initial_state)

    if final_state.error and not final_state.robot_steps:
        raise HTTPException(status_code=500, detail=final_state.error)

    return PipelineRunResponse(
        success=final_state.error is None,
        changelog_report=final_state.changelog_report,
        ast_nodes_scanned=final_state.ast_nodes_scanned,
        detected_issues=final_state.detected_issues,
        risk_assessment=final_state.risk_assessment,
        patch_result=final_state.patch_result,
        robot_steps=final_state.robot_steps,
        total_execution_time_ms=final_state.total_execution_time_ms,
        error=final_state.error
    )

@router.post("/repo/scan", response_model=RepoScanResponse)
def scan_repository(request: RepoScanRequest):
    """Scans a multi-file directory for Python files matching changelog deprecations."""
    start_time = time.perf_counter()
    repo_dir = Path(request.repo_path)

    if not repo_dir.exists() or not repo_dir.is_dir():
        raise HTTPException(status_code=400, detail=f"Invalid repository directory: {request.repo_path}")

    # Step 1: Extract breaking changes once
    changelog_report = ChangelogExtractor.extract(request.changelog_text)
    if not changelog_report.breaking_changes:
        raise HTTPException(status_code=400, detail="No breaking changes could be parsed from the changelog.")

    scanned_files: List[FileScanResult] = []
    combined_diff_parts: List[str] = []
    total_issues = 0
    has_red = False
    has_yellow = False

    # Traverse directory (ignore venv, .git, node_modules)
    ignored_dirs = {"venv", ".venv", ".git", "node_modules", "__pycache__", ".pytest_cache", "build", "dist"}

    for root, dirs, files in os.walk(repo_dir):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for f in files:
            if f.endswith(".py"):
                full_path = Path(root) / f
                rel_path = full_path.relative_to(repo_dir).as_posix()
                try:
                    with open(full_path, "r", encoding="utf-8") as fp:
                        content = fp.read()
                except Exception:
                    continue

                _, issues = CodeScanner.parse_and_scan(
                    source_code=content,
                    breaking_changes=changelog_report.breaking_changes,
                    file_path=rel_path
                )

                if issues:
                    total_issues += len(issues)
                    file_severity = "YELLOW"
                    for iss in issues:
                        if iss.severity == "RED":
                            file_severity = "RED"
                            has_red = True
                        elif iss.severity == "YELLOW":
                            has_yellow = True

                    # Generate patch for this file
                    patch = PatchEngine.generate_patch(
                        original_code=content,
                        detected_issues=issues,
                        breaking_changes=changelog_report.breaking_changes,
                        file_path=rel_path
                    )

                    if patch.unified_diff:
                        combined_diff_parts.append(patch.unified_diff)

                    scanned_files.append(
                        FileScanResult(
                            file_path=str(full_path),
                            relative_path=rel_path,
                            issues_count=len(issues),
                            severity=file_severity,
                            detected_issues=issues,
                            unified_diff=patch.unified_diff,
                            is_ast_valid=patch.is_ast_valid
                        )
                    )

    overall_traffic = "RED" if has_red else ("YELLOW" if has_yellow else "GREEN")
    duration = (time.perf_counter() - start_time) * 1000

    return RepoScanResponse(
        repo_path=str(repo_dir),
        scanned_files_count=len(scanned_files),
        total_issues=total_issues,
        overall_traffic_light=overall_traffic,
        files=scanned_files,
        combined_patch="\n".join(combined_diff_parts),
        execution_time_ms=round(duration, 2)
    )

@router.post("/patch/export")
def export_patch_file(diff_content: str, filename: str = "diffguard_migration.diff"):
    """Returns downloadable .diff patch file content."""
    return Response(
        content=diff_content,
        media_type="text/x-diff",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
