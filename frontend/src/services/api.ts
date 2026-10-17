import {
  PipelineRunResponse,
  PresetScenario,
  RepoScanResponse,
} from '../types';

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function fetchPresets(): Promise<PresetScenario[]> {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error('Failed to load presets');
  return res.json();
}

export async function fetchPresetById(id: string): Promise<PresetScenario> {
  const res = await fetch(`${API_BASE}/presets/${id}`);
  if (!res.ok) throw new Error(`Failed to load preset ${id}`);
  return res.json();
}

export async function runPipeline(
  changelog_text: string,
  source_code: string,
  file_path: string = 'main.py'
): Promise<PipelineRunResponse> {
  const res = await fetch(`${API_BASE}/pipeline/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changelog_text,
      source_code,
      file_path,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Pipeline execution failed' }));
    throw new Error(errorData.detail || 'Pipeline execution failed');
  }

  return res.json();
}

export async function scanRepository(
  repo_path: string,
  changelog_text: string
): Promise<RepoScanResponse> {
  const res = await fetch(`${API_BASE}/repo/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_path, changelog_text }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Repository scan failed' }));
    throw new Error(errorData.detail || 'Repository scan failed');
  }

  return res.json();
}
