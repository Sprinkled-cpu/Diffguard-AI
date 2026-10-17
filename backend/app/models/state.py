"""State definitions for LangGraph assembly pipeline."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.schemas import (
    ChangelogReport,
    DetectedIssue,
    RiskAssessment,
    PatchResult,
    RobotStepLog,
    BreakingChangeItem,
)

class DiffGuardState(BaseModel):
    # Inputs
    raw_changelog: str = ""
    source_code: str = ""
    file_path: str = "main.py"
    use_llm: bool = False
    api_key: Optional[str] = None

    # Step 1: Extractor (Robot 1)
    changelog_report: ChangelogReport = Field(default_factory=ChangelogReport)
    
    # Step 2: Inspector (Robot 2)
    ast_nodes_scanned: int = 0
    detected_issues: List[DetectedIssue] = Field(default_factory=list)

    # Step 3: Risk Assessor (Robot 3)
    risk_assessment: RiskAssessment = Field(default_factory=RiskAssessment)

    # Step 4: Mechanic (Robot 4)
    patch_result: PatchResult = Field(
        default_factory=lambda: PatchResult(
            original_code="",
            patched_code="",
            unified_diff="",
            is_ast_valid=True
        )
    )

    # Pipeline status & observability
    robot_steps: List[RobotStepLog] = Field(default_factory=list)
    current_step: str = "idle"
    completed_steps: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    total_execution_time_ms: float = 0.0
