import React from 'react';
import ChangelogPanel from './ChangelogPanel';
import CodeEditorPanel from './CodeEditorPanel';
import { DetectedIssue, PresetScenario } from '../../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplitWorkspaceProps {
  changelog: string;
  onChangelogChange: (val: string) => void;
  sourceCode: string;
  onSourceCodeChange: (val: string) => void;
  fileName: string;
  onFileNameChange: (val: string) => void;
  detectedIssues: DetectedIssue[];
  presets: PresetScenario[];
  onSelectPreset: (presetId: string) => void;
}

export const SplitWorkspace: React.FC<SplitWorkspaceProps> = ({
  changelog,
  onChangelogChange,
  sourceCode,
  onSourceCodeChange,
  fileName,
  onFileNameChange,
  detectedIssues,
  presets,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-4">
      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-electric-400" />
          Quick Scenarios:
        </span>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className="shrink-0 px-2.5 py-1 rounded-md bg-midnight-900 border border-midnight-700 hover:border-electric-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                p.severity === 'RED' ? 'bg-cyber-red' : 'bg-cyber-amber'
              }`}
            />
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Split Workspace Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        <ChangelogPanel value={changelog} onChange={onChangelogChange} />
        <CodeEditorPanel
          value={sourceCode}
          onChange={onSourceCodeChange}
          fileName={fileName}
          onFileNameChange={onFileNameChange}
          detectedIssues={detectedIssues}
        />
      </div>
    </div>
  );
};

export default SplitWorkspace;
