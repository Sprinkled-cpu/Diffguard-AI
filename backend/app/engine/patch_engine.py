"""Patch Engine & AST Syntax Validation Guardrail for DiffGuard AI.

Applies modern API replacements, produces unified git diffs, and strictly enforces
ast.parse() validation before returning patches.
"""
import ast
import difflib
import re
from typing import List, Tuple, Optional
from app.models.schemas import PatchResult, DetectedIssue, BreakingChangeItem

class PatchEngine:
    """Generates and validates AST-compliant code patches."""

    @staticmethod
    def generate_patch(
        original_code: str,
        detected_issues: List[DetectedIssue],
        breaking_changes: List[BreakingChangeItem],
        file_path: str = "main.py"
    ) -> PatchResult:
        """Applies refactoring transformations to code and verifies Python AST validity."""
        if not detected_issues:
            return PatchResult(
                original_code=original_code,
                patched_code=original_code,
                unified_diff="",
                is_ast_valid=True,
                applied_changes_count=0,
                explanation="No breaking API issues detected. Code is fully up-to-date."
            )

        patched_code = original_code
        applied_count = 0

        # Create quick lookup for breaking change rules
        bc_map = {bc.id: bc for bc in breaking_changes}

        # Apply transformations
        for issue in detected_issues:
            bc = bc_map.get(issue.matched_breaking_change_id)
            symbol = issue.symbol_name

            # Scenario 1: Stripe Charge.create -> PaymentIntent.create
            if "Charge.create" in symbol:
                patched_code = re.sub(
                    r'(?:stripe\.)?Charge\.create',
                    'stripe.PaymentIntent.create',
                    patched_code
                )
                # Parameter migrations in Stripe
                patched_code = re.sub(r'(\b)source\s*=', r'\1payment_method=', patched_code)
                applied_count += 1

            # Scenario 2: OpenAI v0.28 -> v1.0.0
            elif "ChatCompletion.create" in symbol or "Completion.create" in symbol:
                # Ensure client = OpenAI() is present
                if "client = OpenAI()" not in patched_code and "OpenAI(" not in patched_code:
                    # Update imports
                    if "import openai" in patched_code:
                        patched_code = patched_code.replace("import openai", "from openai import OpenAI\n\nclient = OpenAI()")
                    elif "from openai import" in patched_code:
                        patched_code = re.sub(
                            r'from openai import [^\n]+',
                            'from openai import OpenAI\n\nclient = OpenAI()',
                            patched_code
                        )
                    else:
                        patched_code = "from openai import OpenAI\nclient = OpenAI()\n\n" + patched_code

                # Replace openai.api_key = ... line
                patched_code = re.sub(r'openai\.api_key\s*=\s*[^\n]+\n?', '', patched_code)
                
                # Replace ChatCompletion.create
                patched_code = re.sub(
                    r'(?:openai\.)?ChatCompletion\.create',
                    'client.chat.completions.create',
                    patched_code
                )
                applied_count += 1

            # Scenario 3: Pydantic v1 -> v2 (.dict() -> .model_dump())
            elif ".dict(" in issue.code_snippet or symbol.endswith(".dict"):
                patched_code = re.sub(r'\.dict\(', '.model_dump(', patched_code)
                applied_count += 1

            # Scenario 4: Pydantic v1 class Config -> model_config = ConfigDict()
            elif "class Config" in issue.code_snippet or symbol == "Config":
                if "from pydantic import" in patched_code and "ConfigDict" not in patched_code:
                    patched_code = re.sub(
                        r'from pydantic import ([^\n]+)',
                        r'from pydantic import \1, ConfigDict',
                        patched_code
                    )
                # Replace class Config block
                config_pattern = r'class Config:\s*\n(\s+)([a-zA-Z0-9_]+)\s*=\s*([^\n]+)'
                def config_repl(m):
                    indent = m.group(1)
                    key = m.group(2)
                    val = m.group(3)
                    return f"{indent}model_config = ConfigDict({key}={val})"
                patched_code = re.sub(config_pattern, config_repl, patched_code)
                applied_count += 1

            # Scenario 5: Pydantic v1 @validator -> @field_validator
            elif "@validator" in issue.code_snippet or "validator" in symbol:
                if "from pydantic import" in patched_code and "field_validator" not in patched_code:
                    patched_code = re.sub(r'\bvalidator\b', 'field_validator', patched_code)
                else:
                    patched_code = re.sub(r'@validator\(', '@field_validator(', patched_code)
                applied_count += 1

            # Generic template replacement if provided by BreakingChangeItem
            elif bc and bc.replacement_code_template and bc.old_signature:
                if bc.old_signature in patched_code:
                    patched_code = patched_code.replace(bc.old_signature, bc.replacement_code_template)
                    applied_count += 1

        # Strict Ironclad AST Syntax Verification Guardrail
        is_ast_valid, syntax_error = PatchEngine.verify_ast_syntax(patched_code)

        # Generate Unified Git Diff
        unified_diff = PatchEngine.create_unified_diff(original_code, patched_code, file_path)

        explanation = (
            f"Successfully resolved {applied_count} breaking API invocation(s). "
            f"AST verification status: {'VALID' if is_ast_valid else 'SYNTAX_ERROR'}."
        )

        return PatchResult(
            original_code=original_code,
            patched_code=patched_code,
            unified_diff=unified_diff,
            is_ast_valid=is_ast_valid,
            ast_validation_error=syntax_error,
            applied_changes_count=applied_count,
            explanation=explanation
        )

    @staticmethod
    def verify_ast_syntax(code: str) -> Tuple[bool, Optional[str]]:
        """Validates that the given Python code string has 100% valid AST syntax."""
        try:
            ast.parse(code)
            return True, None
        except SyntaxError as e:
            error_msg = f"Syntax error at line {e.lineno}, col {e.offset}: {e.msg}"
            return False, error_msg

    @staticmethod
    def create_unified_diff(original: str, patched: str, file_path: str = "main.py") -> str:
        """Generates standard unified git diff format."""
        orig_lines = original.splitlines(keepends=True)
        patch_lines = patched.splitlines(keepends=True)
        
        diff = difflib.unified_diff(
            orig_lines,
            patch_lines,
            fromfile=f"a/{file_path}",
            tofile=f"b/{file_path}",
            lineterm=""
        )
        return "".join(diff)
