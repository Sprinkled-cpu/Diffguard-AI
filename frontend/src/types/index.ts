export type SeverityLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface ParamChange {
  old_param: string;
  new_param?: string;
  action: 'removed' | 'renamed' | 'type_changed' | 'default_changed' | 'added_required';
  description?: string;
}

export interface BreakingChangeItem {
  id: string;
  library: string;
  symbol: string;
  change_type: 'removed' | 'deprecated' | 'signature_changed' | 'renamed' | 'endpoint_dropped';
  old_signature: string;
  new_signature: string;
  description: string;
  param_changes: ParamChange[];
  severity: SeverityLevel;
  migration_hint: string;
  replacement_code_template?: string;
}

export interface ChangelogReport {
  library_name: string;
  version_from?: string;
  version_to?: string;
  summary: string;
  breaking_changes: BreakingChangeItem[];
  extracted_count: number;
}

export interface DetectedIssue {
  id: string;
  file_path: string;
  line_number: number;
  col_offset: number;
  end_line_number?: number;
  end_col_offset?: number;
  symbol_name: string;
  matched_breaking_change_id?: string;
  code_snippet: string;
  change_type: string;
  severity: SeverityLevel;
  root_cause: string;
  suggested_fix: string;
  ast_node_type: string;
}

export interface RiskAssessment {
  overall_score: number;
  traffic_light: SeverityLevel;
  critical_issues_count: number;
  warning_issues_count: number;
  safe_issues_count: number;
  risk_summary: string;
  runtime_failure_prediction: string;
  affected_files: string[];
}

export interface PatchResult {
  original_code: string;
  patched_code: string;
  unified_diff: string;
  is_ast_valid: boolean;
  ast_validation_error?: string;
  applied_changes_count: number;
  explanation: string;
}

export interface RobotStepLog {
  robot_id: number;
  robot_name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  execution_time_ms: number;
  logs: string[];
  summary: string;
}

export interface PipelineRunResponse {
  success: boolean;
  changelog_report: ChangelogReport;
  ast_nodes_scanned: number;
  detected_issues: DetectedIssue[];
  risk_assessment: RiskAssessment;
  patch_result: PatchResult;
  robot_steps: RobotStepLog[];
  total_execution_time_ms: number;
  error?: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  library: string;
  tagline: string;
  severity: SeverityLevel;
  description: string;
  changelog_text: string;
  sample_code: string;
  file_name: string;
}

export interface FileScanResult {
  file_path: string;
  relative_path: string;
  issues_count: number;
  severity: SeverityLevel;
  detected_issues: DetectedIssue[];
  unified_diff?: string;
  is_ast_valid: boolean;
}

export interface RepoScanResponse {
  repo_path: string;
  scanned_files_count: number;
  total_issues: number;
  overall_traffic_light: SeverityLevel;
  files: FileScanResult[];
  combined_patch: string;
  execution_time_ms: number;
}
