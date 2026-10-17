"""AST Parser and Visitor for DiffGuard AI.

Uses Python's native `ast` module to scan user codebases for deprecated API invocations,
parameter signature changes, and removed symbols with line-level precision.
"""
import ast
from typing import List, Dict, Optional, Tuple, Set, Any
from app.models.schemas import DetectedIssue, BreakingChangeItem

class ASTSymbolVisitor(ast.NodeVisitor):
    """Scans Python AST for API calls, attribute accesses, and decorators."""

    def __init__(self, source_code: str, file_path: str = "main.py"):
        self.source_code = source_code
        self.source_lines = source_code.splitlines()
        self.file_path = file_path
        self.node_count = 0
        
        # Import map: alias/name -> full target module/symbol
        # e.g. "st" -> "stripe", "Charge" -> "stripe.Charge"
        self.import_aliases: Dict[str, str] = {}
        self.imported_modules: Set[str] = set()
        
        # Recorded occurrences: call_path, node, kwargs
        self.calls: List[Dict[str, Any]] = []
        self.attributes: List[Dict[str, Any]] = []
        self.decorators: List[Dict[str, Any]] = []
        self.classes: List[Dict[str, Any]] = []

    def visit(self, node: ast.AST):
        self.node_count += 1
        return super().visit(node)

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            name = alias.name
            asname = alias.asname or name
            self.import_aliases[asname] = name
            self.imported_modules.add(name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        self.imported_modules.add(module)
        for alias in node.names:
            name = alias.name
            asname = alias.asname or name
            full_path = f"{module}.{name}" if module else name
            self.import_aliases[asname] = full_path
        self.generic_visit(node)

    def _resolve_expr_path(self, expr: ast.AST) -> str:
        """Resolve an AST expression (Name or Attribute chain) to its dotted path string."""
        if isinstance(expr, ast.Name):
            return self.import_aliases.get(expr.id, expr.id)
        elif isinstance(expr, ast.Attribute):
            base_path = self._resolve_expr_path(expr.value)
            return f"{base_path}.{expr.attr}" if base_path else expr.attr
        elif isinstance(expr, ast.Call):
            return self._resolve_expr_path(expr.func)
        return ""

    def visit_Call(self, node: ast.Call):
        func_path = self._resolve_expr_path(node.func)
        kwargs = {kw.arg: kw.value for kw in node.keywords if kw.arg}
        
        # Capture snippet
        snippet = self._get_snippet(node)
        
        self.calls.append({
            "path": func_path,
            "node": node,
            "kwargs": kwargs,
            "snippet": snippet,
            "lineno": getattr(node, "lineno", 1),
            "col_offset": getattr(node, "col_offset", 0),
            "end_lineno": getattr(node, "end_lineno", getattr(node, "lineno", 1)),
            "end_col_offset": getattr(node, "end_col_offset", 0),
        })
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        attr_path = self._resolve_expr_path(node)
        snippet = self._get_snippet(node)
        self.attributes.append({
            "path": attr_path,
            "node": node,
            "snippet": snippet,
            "lineno": getattr(node, "lineno", 1),
            "col_offset": getattr(node, "col_offset", 0),
            "end_lineno": getattr(node, "end_lineno", getattr(node, "lineno", 1)),
            "end_col_offset": getattr(node, "end_col_offset", 0),
        })
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        for dec in node.decorator_list:
            dec_path = self._resolve_expr_path(dec)
            self.decorators.append({
                "path": dec_path,
                "node": dec,
                "snippet": self._get_snippet(dec),
                "lineno": getattr(dec, "lineno", node.lineno),
                "col_offset": getattr(dec, "col_offset", 0),
                "end_lineno": getattr(dec, "end_lineno", getattr(dec, "lineno", node.lineno)),
                "end_col_offset": getattr(dec, "end_col_offset", 0),
            })
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef):
        self.classes.append({
            "name": node.name,
            "node": node,
            "snippet": self._get_snippet(node),
            "lineno": getattr(node, "lineno", 1),
            "col_offset": getattr(node, "col_offset", 0),
            "end_lineno": getattr(node, "end_lineno", getattr(node, "lineno", 1)),
            "end_col_offset": getattr(node, "end_col_offset", 0),
        })
        self.generic_visit(node)

    def _get_snippet(self, node: ast.AST) -> str:
        """Extract exact line or multi-line snippet from source code."""
        start = max(0, getattr(node, "lineno", 1) - 1)
        end = getattr(node, "end_lineno", getattr(node, "lineno", 1))
        lines = self.source_lines[start:end]
        return "\n".join(lines).strip()


class CodeScanner:
    """Matches breaking changes against code AST elements."""

    @staticmethod
    def parse_and_scan(
        source_code: str,
        breaking_changes: List[BreakingChangeItem],
        file_path: str = "main.py"
    ) -> Tuple[int, List[DetectedIssue]]:
        """Parses Python source code and identifies occurrences of breaking changes."""
        if not source_code.strip():
            return 0, []

        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            # If source code itself has syntax errors before scanning
            return 0, [
                DetectedIssue(
                    id="syntax-err",
                    file_path=file_path,
                    line_number=e.lineno or 1,
                    col_offset=e.offset or 0,
                    symbol_name="syntax_error",
                    code_snippet=e.text or "",
                    change_type="syntax_error",
                    severity="RED",
                    root_cause=f"Source code has invalid Python syntax: {e.msg}",
                    suggested_fix="Fix source syntax error before running migration scan",
                    ast_node_type="SyntaxError"
                )
            ]

        visitor = ASTSymbolVisitor(source_code=source_code, file_path=file_path)
        visitor.visit(tree)

        detected_issues: List[DetectedIssue] = []
        issue_counter = 1

        for bc in breaking_changes:
            target_symbol = bc.symbol.strip()
            
            # Check calls
            for call in visitor.calls:
                call_path = call["path"]
                # Match path or suffix
                matched = CodeScanner._is_symbol_match(target_symbol, call_path)
                
                # Check for parameter specific breaking changes
                param_issues = []
                for param_change in bc.param_changes:
                    if param_change.old_param in call["kwargs"]:
                        param_issues.append(param_change)
                
                if matched or param_issues:
                    severity = bc.severity
                    root_cause = bc.description or f"Invocation of '{target_symbol}' violates upgraded API contract."
                    if param_issues:
                        p_details = ", ".join(f"'{p.old_param}' ({p.action})" for p in param_issues)
                        root_cause += f" Deprecated parameter detected: {p_details}."
                    
                    detected_issues.append(
                        DetectedIssue(
                            id=f"issue-{issue_counter}",
                            file_path=file_path,
                            line_number=call["lineno"],
                            col_offset=call["col_offset"],
                            end_line_number=call["end_lineno"],
                            end_col_offset=call["end_col_offset"],
                            symbol_name=target_symbol or call_path,
                            matched_breaking_change_id=bc.id,
                            code_snippet=call["snippet"],
                            change_type=bc.change_type,
                            severity=severity,
                            root_cause=root_cause,
                            suggested_fix=bc.migration_hint or f"Migrate '{target_symbol}' to '{bc.new_signature}'",
                            ast_node_type="Call"
                        )
                    )
                    issue_counter += 1

            # Check attributes (e.g. openai.api_key or model.dict())
            for attr in visitor.attributes:
                attr_path = attr["path"]
                if CodeScanner._is_symbol_match(target_symbol, attr_path):
                    # Avoid duplicate if this attribute was already flagged as part of a Call
                    is_already_call = any(
                        c["lineno"] == attr["lineno"] and c["col_offset"] <= attr["col_offset"]
                        for c in visitor.calls
                    )
                    if not is_already_call:
                        detected_issues.append(
                            DetectedIssue(
                                id=f"issue-{issue_counter}",
                                file_path=file_path,
                                line_number=attr["lineno"],
                                col_offset=attr["col_offset"],
                                end_line_number=attr["end_lineno"],
                                end_col_offset=attr["end_col_offset"],
                                symbol_name=target_symbol or attr_path,
                                matched_breaking_change_id=bc.id,
                                code_snippet=attr["snippet"],
                                change_type=bc.change_type,
                                severity=bc.severity,
                                root_cause=bc.description or f"Direct access to '{target_symbol}' is deprecated.",
                                suggested_fix=bc.migration_hint or f"Replace with modern pattern: '{bc.new_signature}'",
                                ast_node_type="Attribute"
                            )
                        )
                        issue_counter += 1

            # Check decorators (e.g. @validator in Pydantic)
            for dec in visitor.decorators:
                dec_path = dec["path"]
                if CodeScanner._is_symbol_match(target_symbol, dec_path):
                    detected_issues.append(
                        DetectedIssue(
                            id=f"issue-{issue_counter}",
                            file_path=file_path,
                            line_number=dec["lineno"],
                            col_offset=dec["col_offset"],
                            end_line_number=dec["end_lineno"],
                            end_col_offset=dec["end_col_offset"],
                            symbol_name=target_symbol or dec_path,
                            matched_breaking_change_id=bc.id,
                            code_snippet=dec["snippet"],
                            change_type=bc.change_type,
                            severity=bc.severity,
                            root_cause=bc.description or f"Decorator '@{target_symbol}' is deprecated.",
                            suggested_fix=bc.migration_hint or f"Replace with '@{bc.new_signature}'",
                            ast_node_type="Decorator"
                        )
                    )
                    issue_counter += 1

            # Check nested classes (e.g. `class Config:` inside Pydantic)
            for cls in visitor.classes:
                if target_symbol.endswith(f".{cls['name']}") or target_symbol == cls["name"]:
                    detected_issues.append(
                        DetectedIssue(
                            id=f"issue-{issue_counter}",
                            file_path=file_path,
                            line_number=cls["lineno"],
                            col_offset=cls["col_offset"],
                            end_line_number=cls["end_lineno"],
                            end_col_offset=cls["end_col_offset"],
                            symbol_name=target_symbol or cls["name"],
                            matched_breaking_change_id=bc.id,
                            code_snippet=cls["snippet"],
                            change_type=bc.change_type,
                            severity=bc.severity,
                            root_cause=bc.description or f"Class '{cls['name']}' config format is deprecated.",
                            suggested_fix=bc.migration_hint or f"Migrate to '{bc.new_signature}'",
                            ast_node_type="ClassDef"
                        )
                    )
                    issue_counter += 1

        return visitor.node_count, detected_issues

    @staticmethod
    def _is_symbol_match(target: str, candidate: str) -> bool:
        """Determines if candidate matches target symbol or is a valid suffix/prefix match."""
        if not target or not candidate:
            return False
        
        target = target.strip()
        candidate = candidate.strip()
        
        if target == candidate:
            return True
            
        # Check if target is 'openai.ChatCompletion.create' and candidate is 'ChatCompletion.create'
        if target.endswith(f".{candidate}") or candidate.endswith(f".{target}"):
            return True
            
        # Suffix matching for method chains (e.g. client.chat.completions.create vs openai.ChatCompletion.create)
        target_parts = target.split(".")
        cand_parts = candidate.split(".")
        if len(target_parts) >= 2 and len(cand_parts) >= 2:
            if target_parts[-2:] == cand_parts[-2:]:
                return True
            # Instance method call matching: e.g. target "BaseModel.dict" matches "u.dict"
            if target_parts[-1] == cand_parts[-1] and target_parts[-2] in ("BaseModel", "Model", "Item", "User"):
                return True

        if target.startswith(".") and candidate.endswith(target):
            return True
        if target.endswith(f".{cand_parts[-1]}") and len(target_parts) <= 2:
            return True
                
        return False
