import React, { useState } from 'react';
import { Code2, Copy, Trash2, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { DetectedIssue } from '../../types';

interface CodeEditorPanelProps {
  value: string;
  onChange: (val: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  detectedIssues?: DetectedIssue[];
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  value,
  onChange,
  fileName,
  onFileNameChange,
  detectedIssues = [],
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = value.split('\n');
  const lineNumbers = Array.from({ length: lines.length }, (_, i) => i + 1);

  // Set of flagged lines
  const issueLinesMap = new Map<number, DetectedIssue>();
  detectedIssues.forEach((issue) => {
    issueLinesMap.set(issue.line_number, issue);
  });

  return (
    <div className="flex flex-col h-full bg-midnight-900 border border-midnight-700 rounded-xl overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-midnight-850 border-b border-midnight-700">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyber-cyan" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            className="bg-midnight-950 border border-midnight-700 rounded px-2 py-0.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-electric-500 w-44"
            placeholder="file_name.py"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-midnight-750 text-slate-400 border border-midnight-700">
            Python Source
          </span>
        </div>

        <div className="flex items-center gap-2">
          {detectedIssues.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyber-red/20 text-cyber-crimson border border-cyber-red/30">
              <AlertCircle className="w-3 h-3" />
              {detectedIssues.length} broken site{detectedIssues.length > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Source Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onChange('')}
            className="p-1 rounded text-slate-400 hover:text-cyber-red transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor with Line Numbers */}
      <div className="flex-1 flex overflow-auto bg-midnight-950/70 font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-12 select-none py-3 bg-midnight-900/50 border-r border-midnight-800 text-right pr-3 text-slate-600 font-mono">
          {lineNumbers.map((num) => {
            const hasIssue = issueLinesMap.has(num);
            const issue = issueLinesMap.get(num);
            return (
              <div
                key={num}
                className={`leading-relaxed relative flex items-center justify-end ${
                  hasIssue ? 'text-cyber-red font-bold' : ''
                }`}
                title={issue ? `Broken: ${issue.root_cause}` : undefined}
              >
                {hasIssue && (
                  <span className="absolute -left-1 w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
                )}
                {num}
              </div>
            );
          })}
        </div>

        {/* Code Textarea */}
        <div className="flex-1 p-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your application's Python source code here..."
            className="w-full h-full min-h-[360px] bg-transparent text-slate-200 resize-none focus:outline-none placeholder:text-slate-600 leading-relaxed font-mono whitespace-pre"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Panel Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-midnight-850/80 border-t border-midnight-700 text-[11px] font-mono text-slate-400">
        <span>{lines.length} lines</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

export default CodeEditorPanel;
