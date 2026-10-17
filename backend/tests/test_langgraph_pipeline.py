"""Integration tests for the LangGraph 4-Robot Assembly Line."""
import pytest
from app.models.state import DiffGuardState
from app.engine.langgraph_assembly import (
    LangGraphAssemblyLine,
    ChangelogExtractor,
    ImpactEvaluator,
)
from app.models.schemas import DetectedIssue

def test_robot_1_changelog_extractor_stripe():
    changelog = "Stripe API Notice: Deprecated stripe.Charge.create in favor of stripe.PaymentIntent.create."
    report = ChangelogExtractor.extract(changelog)
    assert report.library_name == "stripe"
    assert len(report.breaking_changes) >= 1
    assert any("Charge.create" in bc.symbol for bc in report.breaking_changes)

def test_robot_1_changelog_extractor_openai():
    changelog = "OpenAI v1.0.0 Migration: Dropped static openai.ChatCompletion.create in favor of client.chat.completions.create."
    report = ChangelogExtractor.extract(changelog)
    assert report.library_name == "openai"
    assert any("ChatCompletion.create" in bc.symbol for bc in report.breaking_changes)

def test_robot_3_impact_evaluator_red():
    issues = [
        DetectedIssue(
            id="1",
            line_number=10,
            symbol_name="stripe.Charge.create",
            code_snippet="stripe.Charge.create()",
            severity="RED"
        )
    ]
    assessment = ImpactEvaluator.evaluate(issues)
    assert assessment.traffic_light == "RED"
    assert assessment.overall_score >= 40
    assert assessment.critical_issues_count == 1
    assert "HIGH CRASH RISK" in assessment.runtime_failure_prediction

def test_robot_3_impact_evaluator_yellow():
    issues = [
        DetectedIssue(
            id="2",
            line_number=5,
            symbol_name="user.dict()",
            code_snippet="user.dict()",
            severity="YELLOW"
        )
    ]
    assessment = ImpactEvaluator.evaluate(issues)
    assert assessment.traffic_light == "YELLOW"
    assert assessment.overall_score == 15
    assert assessment.critical_issues_count == 0
    assert assessment.warning_issues_count == 1

def test_full_4_robot_assembly_line_execution():
    state = DiffGuardState(
        raw_changelog="Stripe Changelog: Deprecate stripe.Charge.create in favor of stripe.PaymentIntent.create.",
        source_code="""import stripe
def charge(token, amt):
    return stripe.Charge.create(amount=amt, source=token)
""",
        file_path="billing.py"
    )

    final_state = LangGraphAssemblyLine.run_assembly_line(state)
    assert final_state.error is None
    assert final_state.current_step == "finished"
    assert len(final_state.robot_steps) == 4
    
    # Check that all 4 robots completed successfully
    assert all(step.status == "completed" for step in final_state.robot_steps)
    
    # Check step outputs
    assert len(final_state.changelog_report.breaking_changes) > 0
    assert len(final_state.detected_issues) > 0
    assert final_state.risk_assessment.traffic_light == "RED"
    assert final_state.patch_result.is_ast_valid is True
    assert "stripe.PaymentIntent.create" in final_state.patch_result.patched_code
    assert final_state.total_execution_time_ms > 0
