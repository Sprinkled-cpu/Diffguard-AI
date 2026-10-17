"""Unit tests for AST Parser and Code Scanner."""
import pytest
from app.engine.ast_parser import CodeScanner, ASTSymbolVisitor
from app.models.schemas import BreakingChangeItem, ParamChange

def test_ast_symbol_visitor_detects_imports():
    code = """
import stripe
import stripe as st
from openai import ChatCompletion as CC
"""
    visitor = ASTSymbolVisitor(code)
    import ast
    visitor.visit(ast.parse(code))
    assert "stripe" in visitor.imported_modules
    assert visitor.import_aliases["st"] == "stripe"
    assert visitor.import_aliases["CC"] == "openai.ChatCompletion"

def test_scanner_flags_stripe_charge_create():
    code = """
import stripe

def checkout(token, amt):
    return stripe.Charge.create(
        amount=amt,
        currency="usd",
        source=token
    )
"""
    bc = BreakingChangeItem(
        id="stripe-1",
        library="stripe",
        symbol="stripe.Charge.create",
        change_type="deprecated",
        old_signature="stripe.Charge.create",
        new_signature="stripe.PaymentIntent.create",
        severity="RED",
        param_changes=[
            ParamChange(old_param="source", new_param="payment_method", action="renamed")
        ]
    )

    node_count, issues = CodeScanner.parse_and_scan(code, [bc])
    assert node_count > 0
    assert len(issues) == 1
    assert issues[0].line_number == 5
    assert issues[0].severity == "RED"
    assert "stripe.Charge.create" in issues[0].symbol_name

def test_scanner_handles_import_alias():
    code = """
import stripe as s

def pay():
    return s.Charge.create(amount=100)
"""
    bc = BreakingChangeItem(
        id="stripe-1",
        library="stripe",
        symbol="stripe.Charge.create",
        change_type="deprecated",
        severity="RED"
    )
    _, issues = CodeScanner.parse_and_scan(code, [bc])
    assert len(issues) == 1
    assert issues[0].line_number == 5

def test_scanner_detects_pydantic_v1_methods_and_classes():
    code = """
from pydantic import BaseModel, validator

class User(BaseModel):
    name: str

    class Config:
        orm_mode = True

    @validator("name")
    def check_name(cls, v):
        return v

def serialize(u):
    return u.dict()
"""
    rules = [
        BreakingChangeItem(
            id="pyd-1",
            library="pydantic",
            symbol="BaseModel.dict",
            change_type="deprecated",
            severity="YELLOW"
        ),
        BreakingChangeItem(
            id="pyd-2",
            library="pydantic",
            symbol="Config",
            change_type="deprecated",
            severity="YELLOW"
        ),
        BreakingChangeItem(
            id="pyd-3",
            library="pydantic",
            symbol="validator",
            change_type="deprecated",
            severity="YELLOW"
        )
    ]
    _, issues = CodeScanner.parse_and_scan(code, rules)
    symbols = [i.symbol_name for i in issues]
    assert any("dict" in s for s in symbols)
    assert any("Config" in s for s in symbols)
    assert any("validator" in s for s in symbols)

def test_scanner_catches_invalid_syntax():
    invalid_code = "def broken_code( : invalid"
    _, issues = CodeScanner.parse_and_scan(invalid_code, [])
    assert len(issues) == 1
    assert issues[0].severity == "RED"
    assert issues[0].ast_node_type == "SyntaxError"
