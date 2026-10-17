"""Unit tests for PatchEngine and AST Syntax Verification Guardrail."""
import ast
import pytest
from app.engine.patch_engine import PatchEngine
from app.models.schemas import DetectedIssue, BreakingChangeItem

def test_verify_ast_syntax_valid():
    valid_code = "def hello():\n    return 'world'\n"
    is_valid, error = PatchEngine.verify_ast_syntax(valid_code)
    assert is_valid is True
    assert error is None

def test_verify_ast_syntax_invalid():
    invalid_code = "def hello(\n    return 'world'\n"
    is_valid, error = PatchEngine.verify_ast_syntax(invalid_code)
    assert is_valid is False
    assert error is not None
    assert "Syntax error" in error

def test_stripe_patch_transformation():
    code = """import stripe

def run_payment(token, amount):
    charge = stripe.Charge.create(amount=amount, source=token)
    return charge
"""
    issue = DetectedIssue(
        id="iss-1",
        line_number=4,
        symbol_name="stripe.Charge.create",
        code_snippet="stripe.Charge.create(amount=amount, source=token)",
        severity="RED"
    )
    result = PatchEngine.generate_patch(
        original_code=code,
        detected_issues=[issue],
        breaking_changes=[]
    )
    assert result.is_ast_valid is True
    assert "stripe.PaymentIntent.create" in result.patched_code
    assert "payment_method=token" in result.patched_code
    assert result.applied_changes_count > 0
    assert "--- a/main.py" in result.unified_diff
    assert "+++ b/main.py" in result.unified_diff

def test_openai_patch_transformation():
    code = """import openai

openai.api_key = "sk-test"

def ask(q):
    return openai.ChatCompletion.create(model="gpt-4o", messages=[{"role": "user", "content": q}])
"""
    issue = DetectedIssue(
        id="iss-2",
        line_number=6,
        symbol_name="openai.ChatCompletion.create",
        code_snippet="openai.ChatCompletion.create(...)",
        severity="RED"
    )
    result = PatchEngine.generate_patch(
        original_code=code,
        detected_issues=[issue],
        breaking_changes=[]
    )
    assert result.is_ast_valid is True
    assert "from openai import OpenAI" in result.patched_code
    assert "client = OpenAI()" in result.patched_code
    assert "client.chat.completions.create" in result.patched_code
    # AST verification
    ast.parse(result.patched_code)

def test_pydantic_patch_transformation():
    code = """from pydantic import BaseModel

class Item(BaseModel):
    name: str

def get_data(item):
    return item.dict()
"""
    issue = DetectedIssue(
        id="iss-3",
        line_number=7,
        symbol_name="Item.dict",
        code_snippet="item.dict()",
        severity="YELLOW"
    )
    result = PatchEngine.generate_patch(
        original_code=code,
        detected_issues=[issue],
        breaking_changes=[]
    )
    assert result.is_ast_valid is True
    assert "item.model_dump()" in result.patched_code
    ast.parse(result.patched_code)
