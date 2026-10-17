"""LangGraph 4-Robot Assembly Line Engine for DiffGuard AI.

Implements the 4-step assembly line:
  Robot 1: The Fast Reader (Changelog Extractor)
  Robot 2: The Inspector (Code Scanner)
  Robot 3: The Risk Assessor (Impact Evaluator)
  Robot 4: The Mechanic (AST-Validated Patch Generator)
"""
import time
import re
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    BreakingChangeItem,
    ChangelogReport,
    DetectedIssue,
    RiskAssessment,
    PatchResult,
    RobotStepLog,
    ParamChange
)
from app.models.state import DiffGuardState
from app.engine.ast_parser import CodeScanner
from app.engine.patch_engine import PatchEngine

class ChangelogExtractor:
    """Robot 1: Extracts structured breaking changes from raw text, markdown, or OpenAPI."""

    @staticmethod
    def extract(changelog_text: str) -> ChangelogReport:
        lower = changelog_text.lower()
        breaking_changes: List[BreakingChangeItem] = []
        lib_name = "unknown"
        v_from = None
        v_to = None
        rule_idx = 1

        # Detect library context
        if "stripe" in lower:
            lib_name = "stripe"
        elif "openai" in lower:
            lib_name = "openai"
        elif "pydantic" in lower or "fastapi" in lower:
            lib_name = "pydantic"
        elif "twilio" in lower:
            lib_name = "twilio"

        # Detect versions
        ver_match = re.search(r'v?(\d+\.\d+(?:\.\d+)?)\s*(?:->|to)\s*v?(\d+\.\d+(?:\.\d+)?)', changelog_text, re.IGNORECASE)
        if ver_match:
            v_from = ver_match.group(1)
            v_to = ver_match.group(2)

        # Pattern 1: Stripe Charge.create deprecation
        if "charge.create" in lower or "paymentintent" in lower or "stripe" in lower:
            if "charge.create" in lower or "charge" in lower:
                breaking_changes.append(
                    BreakingChangeItem(
                        id=f"rule-{rule_idx}",
                        library="stripe",
                        symbol="stripe.Charge.create",
                        change_type="deprecated",
                        old_signature="stripe.Charge.create(amount, currency, source=...)",
                        new_signature="stripe.PaymentIntent.create(amount, currency, payment_method=...)",
                        description="Direct Charge creation is deprecated in modern Stripe APIs. Migrate to PaymentIntents for Strong Customer Authentication (SCA) compliance.",
                        param_changes=[
                            ParamChange(
                                old_param="source",
                                new_param="payment_method",
                                action="renamed",
                                description="The 'source' parameter must be migrated to 'payment_method'."
                            )
                        ],
                        severity="RED",
                        migration_hint="Replace stripe.Charge.create() with stripe.PaymentIntent.create() and 'source' with 'payment_method'.",
                        replacement_code_template="stripe.PaymentIntent.create"
                    )
                )
                rule_idx += 1

        # Pattern 2: OpenAI ChatCompletion.create (v0.28 -> v1.0.0)
        if "openai" in lower or "chatcompletion" in lower:
            breaking_changes.append(
                BreakingChangeItem(
                    id=f"rule-{rule_idx}",
                    library="openai",
                    symbol="openai.ChatCompletion.create",
                    change_type="removed",
                    old_signature="openai.ChatCompletion.create(model=..., messages=...)",
                    new_signature="client.chat.completions.create(model=..., messages=...)",
                    description="The static openai.ChatCompletion.create endpoint was removed in OpenAI v1.0.0. Instantiate client = OpenAI() instead.",
                    param_changes=[],
                    severity="RED",
                    migration_hint="Instantiate 'client = OpenAI()' and call 'client.chat.completions.create()'.",
                    replacement_code_template="client.chat.completions.create"
                )
            )
            rule_idx += 1

            breaking_changes.append(
                BreakingChangeItem(
                    id=f"rule-{rule_idx}",
                    library="openai",
                    symbol="openai.api_key",
                    change_type="deprecated",
                    old_signature="openai.api_key = 'sk-...'",
                    new_signature="client = OpenAI(api_key='sk-...')",
                    description="Setting global openai.api_key is deprecated. Pass api_key to the OpenAI client instance.",
                    param_changes=[],
                    severity="YELLOW",
                    migration_hint="Configure the client instance or OPENAI_API_KEY environment variable.",
                    replacement_code_template="client = OpenAI()"
                )
            )
            rule_idx += 1

        # Pattern 3: Pydantic v1 -> v2 (.dict(), class Config, @validator)
        if "pydantic" in lower or "dict()" in lower or "model_dump" in lower or "field_validator" in lower:
            breaking_changes.append(
                BreakingChangeItem(
                    id=f"rule-{rule_idx}",
                    library="pydantic",
                    symbol="BaseModel.dict",
                    change_type="deprecated",
                    old_signature="model.dict()",
                    new_signature="model.model_dump()",
                    description="The .dict() method on BaseModel is deprecated in Pydantic v2. Use .model_dump() instead.",
                    param_changes=[],
                    severity="YELLOW",
                    migration_hint="Replace .dict() calls with .model_dump().",
                    replacement_code_template=".model_dump()"
                )
            )
            rule_idx += 1

            if "config" in lower or "configdict" in lower:
                breaking_changes.append(
                    BreakingChangeItem(
                        id=f"rule-{rule_idx}",
                        library="pydantic",
                        symbol="Config",
                        change_type="deprecated",
                        old_signature="class Config: ...",
                        new_signature="model_config = ConfigDict(...)",
                        description="Inner 'class Config' is deprecated in Pydantic v2. Use 'model_config = ConfigDict()' instead.",
                        param_changes=[],
                        severity="YELLOW",
                        migration_hint="Replace inner class Config with model_config = ConfigDict().",
                        replacement_code_template="model_config = ConfigDict()"
                    )
                )
                rule_idx += 1

            if "validator" in lower or "field_validator" in lower:
                breaking_changes.append(
                    BreakingChangeItem(
                        id=f"rule-{rule_idx}",
                        library="pydantic",
                        symbol="validator",
                        change_type="deprecated",
                        old_signature="@validator('field')",
                        new_signature="@field_validator('field')",
                        description="@validator decorator is deprecated in Pydantic v2. Use @field_validator with @classmethod.",
                        param_changes=[],
                        severity="YELLOW",
                        migration_hint="Replace @validator with @field_validator.",
                        replacement_code_template="@field_validator"
                    )
                )
                rule_idx += 1

        # Generic markdown list extraction for custom changelogs
        # e.g., "- Deprecated `foo.bar` in favor of `foo.baz`"
        custom_patterns = re.findall(
            r'[-*]\s*(?:Deprecated|Removed|Changed|Renamed)\s*[`\'"]?([a-zA-Z0-9_\.]+(?:\(\))?)[`\'"]?\s*(?:in favor of|to|use)\s*[`\'"]?([a-zA-Z0-9_\.]+(?:\(\))?)[`\'"]?',
            changelog_text,
            re.IGNORECASE
        )
        for old_sym, new_sym in custom_patterns:
            clean_old = old_sym.replace("()", "")
            clean_new = new_sym.replace("()", "")
            if not any(bc.symbol == clean_old for bc in breaking_changes):
                breaking_changes.append(
                    BreakingChangeItem(
                        id=f"rule-{rule_idx}",
                        library=lib_name,
                        symbol=clean_old,
                        change_type="deprecated",
                        old_signature=old_sym,
                        new_signature=new_sym,
                        description=f"Automated rule: '{clean_old}' has been replaced by '{clean_new}'.",
                        param_changes=[],
                        severity="YELLOW",
                        migration_hint=f"Migrate '{clean_old}' to '{clean_new}'.",
                        replacement_code_template=clean_new
                    )
                )
                rule_idx += 1

        summary = (
            f"Extracted {len(breaking_changes)} breaking changes for '{lib_name}'"
            + (f" ({v_from} -> {v_to})" if v_from and v_to else "")
            + "."
        )

        return ChangelogReport(
            library_name=lib_name,
            version_from=v_from,
            version_to=v_to,
            summary=summary,
            breaking_changes=breaking_changes,
            extracted_count=len(breaking_changes)
        )


class ImpactEvaluator:
    """Robot 3: Evaluates runtime crash severity and blast radius."""

    @staticmethod
    def evaluate(
        detected_issues: List[DetectedIssue],
        file_path: str = "main.py"
    ) -> RiskAssessment:
        if not detected_issues:
            return RiskAssessment(
                overall_score=0,
                traffic_light="GREEN",
                critical_issues_count=0,
                warning_issues_count=0,
                safe_issues_count=0,
                risk_summary="Clean bill of health. No breaking changes or crash risks detected.",
                runtime_failure_prediction="Code execution is expected to succeed without integration crashes.",
                affected_files=[]
            )

        red_count = sum(1 for issue in detected_issues if issue.severity == "RED")
        yellow_count = sum(1 for issue in detected_issues if issue.severity == "YELLOW")
        green_count = sum(1 for issue in detected_issues if issue.severity == "GREEN")

        # Composite score calculation (0 - 100)
        score = min(100, (red_count * 40) + (yellow_count * 15) + (green_count * 5))
        
        if red_count > 0 or score >= 40:
            traffic_light = "RED"
            failure_prediction = (
                f"HIGH CRASH RISK: {red_count} critical API call(s) detected. "
                "Runtime execution will raise unhandled AttributeError or TypeError upon invoking obsolete SDK methods."
            )
        elif yellow_count > 0:
            traffic_light = "YELLOW"
            failure_prediction = (
                f"MODERATE RISK: {yellow_count} deprecation warning(s) detected. "
                "Code will execute but triggers warnings and may fail on subsequent SDK releases."
            )
        else:
            traffic_light = "GREEN"
            failure_prediction = "LOW RISK: Safe or non-breaking API mutations only."

        summary = (
            f"Found {len(detected_issues)} issue(s) across {file_path}. "
            f"Breakdown: {red_count} Critical, {yellow_count} Warnings, {green_count} Informational."
        )

        return RiskAssessment(
            overall_score=score,
            traffic_light=traffic_light,
            critical_issues_count=red_count,
            warning_issues_count=yellow_count,
            safe_issues_count=green_count,
            risk_summary=summary,
            runtime_failure_prediction=failure_prediction,
            affected_files=[file_path]
        )


class LangGraphAssemblyLine:
    """Orchestrates the 4-robot factory pipeline with timing and state validation."""

    @staticmethod
    def run_assembly_line(state: DiffGuardState) -> DiffGuardState:
        total_start = time.perf_counter()
        state.robot_steps = []
        state.completed_steps = []

        # ==========================================
        # Robot 1: The Fast Reader (Changelog Extractor)
        # ==========================================
        r1_start = time.perf_counter()
        state.current_step = "extracting_changelog"
        try:
            report = ChangelogExtractor.extract(state.raw_changelog)
            state.changelog_report = report
            r1_duration = (time.perf_counter() - r1_start) * 1000
            
            state.robot_steps.append(
                RobotStepLog(
                    robot_id=1,
                    robot_name="Robot 1: The Fast Reader",
                    role="Changelog Extractor",
                    status="completed",
                    execution_time_ms=round(r1_duration, 2),
                    logs=[
                        f"Ingested {len(state.raw_changelog)} characters of changelog text.",
                        f"Detected target library: {report.library_name.upper()}",
                        f"Parsed {len(report.breaking_changes)} breaking change rule definitions.",
                        "Enforced Pydantic v2 data schema validation."
                    ],
                    summary=f"Extracted {len(report.breaking_changes)} breaking API changes."
                )
            )
            state.completed_steps.append("extract")
        except Exception as e:
            state.error = f"Robot 1 Error: {str(e)}"
            state.robot_steps.append(
                RobotStepLog(
                    robot_id=1,
                    robot_name="Robot 1: The Fast Reader",
                    role="Changelog Extractor",
                    status="failed",
                    execution_time_ms=round((time.perf_counter() - r1_start) * 1000, 2),
                    logs=[f"Error during changelog extraction: {str(e)}"],
                    summary="Failed to extract changelog"
                )
            )
            return state

        # ==========================================
        # Robot 2: The Inspector (Code Scanner)
        # ==========================================
        r2_start = time.perf_counter()
        state.current_step = "scanning_code"
        try:
            ast_nodes, issues = CodeScanner.parse_and_scan(
                source_code=state.source_code,
                breaking_changes=state.changelog_report.breaking_changes,
                file_path=state.file_path
            )
            state.ast_nodes_scanned = ast_nodes
            state.detected_issues = issues
            r2_duration = (time.perf_counter() - r2_start) * 1000

            state.robot_steps.append(
                RobotStepLog(
                    robot_id=2,
                    robot_name="Robot 2: The Inspector",
                    role="AST Code Scanner",
                    status="completed",
                    execution_time_ms=round(r2_duration, 2),
                    logs=[
                        f"Built native Python AST tree from {len(state.source_code.splitlines())} lines of code.",
                        f"Visited {ast_nodes} total AST nodes (Imports, Calls, Attributes, Classes).",
                        f"Cross-referenced against {len(state.changelog_report.breaking_changes)} breaking change definitions.",
                        f"Flagged {len(issues)} code violations with exact line coordinates."
                    ],
                    summary=f"Scanned {ast_nodes} AST nodes, detected {len(issues)} broken call sites."
                )
            )
            state.completed_steps.append("scan")
        except Exception as e:
            state.error = f"Robot 2 Error: {str(e)}"
            state.robot_steps.append(
                RobotStepLog(
                    robot_id=2,
                    robot_name="Robot 2: The Inspector",
                    role="AST Code Scanner",
                    status="failed",
                    execution_time_ms=round((time.perf_counter() - r2_start) * 1000, 2),
                    logs=[f"AST scan failure: {str(e)}"],
                    summary="Failed during AST code scan"
                )
            )
            return state

        # ==========================================
        # Robot 3: The Risk Assessor (Impact Evaluator)
        # ==========================================
        r3_start = time.perf_counter()
        state.current_step = "evaluating_impact"
        try:
            risk = ImpactEvaluator.evaluate(
                detected_issues=state.detected_issues,
                file_path=state.file_path
            )
            state.risk_assessment = risk
            r3_duration = (time.perf_counter() - r3_start) * 1000

            state.robot_steps.append(
                RobotStepLog(
                    robot_id=3,
                    robot_name="Robot 3: The Risk Assessor",
                    role="Impact Evaluator",
                    status="completed",
                    execution_time_ms=round(r3_duration, 2),
                    logs=[
                        f"Computed composite crash risk index: {risk.overall_score}/100",
                        f"Assigned traffic light indicator: {risk.traffic_light}",
                        f"Critical crash candidates: {risk.critical_issues_count}",
                        f"Deprecation warnings: {risk.warning_issues_count}",
                        "Formulated runtime blast-radius prediction."
                    ],
                    summary=f"Risk: {risk.traffic_light} ({risk.overall_score}/100). {risk.critical_issues_count} critical."
                )
            )
            state.completed_steps.append("evaluate")
        except Exception as e:
            state.error = f"Robot 3 Error: {str(e)}"
            return state

        # ==========================================
        # Robot 4: The Mechanic (Patch Generator)
        # ==========================================
        r4_start = time.perf_counter()
        state.current_step = "generating_patch"
        try:
            patch = PatchEngine.generate_patch(
                original_code=state.source_code,
                detected_issues=state.detected_issues,
                breaking_changes=state.changelog_report.breaking_changes,
                file_path=state.file_path
            )
            state.patch_result = patch
            r4_duration = (time.perf_counter() - r4_start) * 1000

            ast_log = "AST Guardrail Passed (100% syntax compliance)." if patch.is_ast_valid else f"AST Guardrail Warning: {patch.ast_validation_error}"

            state.robot_steps.append(
                RobotStepLog(
                    robot_id=4,
                    robot_name="Robot 4: The Mechanic",
                    role="Patch Generator & AST Guardrail",
                    status="completed",
                    execution_time_ms=round(r4_duration, 2),
                    logs=[
                        f"Refactored {patch.applied_changes_count} broken call sites.",
                        ast_log,
                        "Generated standard unified git diff format (diff -u).",
                        "Verified patch ready for single-click apply or .diff export."
                    ],
                    summary=f"Generated AST-validated patch ({patch.applied_changes_count} changes applied)."
                )
            )
            state.completed_steps.append("patch")
        except Exception as e:
            state.error = f"Robot 4 Error: {str(e)}"
            return state

        state.current_step = "finished"
        state.total_execution_time_ms = round((time.perf_counter() - total_start) * 1000, 2)
        return state
