"""Pydantic v2 schemas for DiffGuard AI."""
from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field

class ParamChange(BaseModel):
    old_param: str
    new_param: Optional[str] = None
    action: Literal["removed", "renamed", "type_changed", "default_changed", "added_required"]
    description: Optional[str] = None

class BreakingChangeItem(BaseModel):
    id: str = Field(description="Unique identifier for the breaking change rule")
    library: str = Field(default="", description="Target library or SDK, e.g. stripe, openai")
    symbol: str = Field(description="API symbol or invocation path, e.g. stripe.Charge.create")
    change_type: Literal["removed", "deprecated", "signature_changed", "renamed", "endpoint_dropped"] = "deprecated"
    old_signature: str = Field(default="", description="Obsolete method/function signature")
    new_signature: str = Field(default="", description="Modern replacement signature")
    description: str = Field(default="", description="Detailed human-readable explanation of the change")
    param_changes: List[ParamChange] = Field(default_factory=list)
    severity: Literal["RED", "YELLOW", "GREEN"] = "YELLOW"
    migration_hint: str = Field(default="", description="Actionable migration guidance")
    replacement_code_template: Optional[str] = Field(default=None, description="Suggested replacement code pattern")

class ChangelogReport(BaseModel):
    library_name: str = ""
    version_from: Optional[str] = None
    version_to: Optional[str] = None
    summary: str = ""
    breaking_changes: List[BreakingChangeItem] = Field(default_factory=list)
    extracted_count: int = 0

class DetectedIssue(BaseModel):
    id: str
    file_path: str = "main.py"
    line_number: int
    col_offset: int = 0
    end_line_number: Optional[int] = None
    end_col_offset: Optional[int] = None
    symbol_name: str
    matched_breaking_change_id: Optional[str] = None
    code_snippet: str
    change_type: str = "deprecated"
    severity: Literal["RED", "YELLOW", "GREEN"] = "YELLOW"
    root_cause: str = ""
    suggested_fix: str = ""
    ast_node_type: str = "Call"

class RiskAssessment(BaseModel):
    overall_score: int = Field(ge=0, le=100, default=0, description="0=Safe, 100=Immediate fatal crash")
    traffic_light: Literal["RED", "YELLOW", "GREEN"] = "GREEN"
    critical_issues_count: int = 0
    warning_issues_count: int = 0
    safe_issues_count: int = 0
    risk_summary: str = ""
    runtime_failure_prediction: str = ""
    affected_files: List[str] = Field(default_factory=list)

class PatchResult(BaseModel):
    original_code: str
    patched_code: str
    unified_diff: str
    is_ast_valid: bool = True
    ast_validation_error: Optional[str] = None
    applied_changes_count: int = 0
    explanation: str = ""

class RobotStepLog(BaseModel):
    robot_id: int
    robot_name: str
    role: str
    status: Literal["idle", "running", "completed", "failed"] = "idle"
    execution_time_ms: float = 0.0
    logs: List[str] = Field(default_factory=list)
    summary: str = ""

class PipelineRunRequest(BaseModel):
    changelog_text: str = Field(..., description="Release notes, changelog markdown, or OpenAPI spec")
    source_code: str = Field(..., description="Target Python source code to scan and patch")
    file_path: Optional[str] = "main.py"
    use_llm: bool = False
    api_key: Optional[str] = None

class PipelineRunResponse(BaseModel):
    success: bool = True
    changelog_report: ChangelogReport
    ast_nodes_scanned: int
    detected_issues: List[DetectedIssue]
    risk_assessment: RiskAssessment
    patch_result: PatchResult
    robot_steps: List[RobotStepLog]
    total_execution_time_ms: float
    error: Optional[str] = None

class SingleStepRequest(BaseModel):
    step_name: Literal["extract", "scan", "evaluate", "patch"]
    changelog_text: Optional[str] = ""
    source_code: Optional[str] = ""
    file_path: Optional[str] = "main.py"
    extracted_changes: Optional[List[BreakingChangeItem]] = None
    detected_issues: Optional[List[DetectedIssue]] = None
    risk_assessment: Optional[RiskAssessment] = None

class PresetScenario(BaseModel):
    id: str
    title: str
    library: str
    tagline: str
    severity: Literal["RED", "YELLOW", "GREEN"]
    description: str
    changelog_text: str
    sample_code: str
    file_name: str

class RepoScanRequest(BaseModel):
    repo_path: str = Field(..., description="Local directory path to scan for Python files")
    changelog_text: str = Field(..., description="Changelog or release notes to check against")

class FileScanResult(BaseModel):
    file_path: str
    relative_path: str
    issues_count: int
    severity: Literal["RED", "YELLOW", "GREEN"]
    detected_issues: List[DetectedIssue]
    unified_diff: Optional[str] = None
    is_ast_valid: bool = True

class RepoScanResponse(BaseModel):
    repo_path: str
    scanned_files_count: int
    total_issues: int
    overall_traffic_light: Literal["RED", "YELLOW", "GREEN"]
    files: List[FileScanResult]
    combined_patch: str
    execution_time_ms: float
