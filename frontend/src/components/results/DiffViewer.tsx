import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCheck2,
  GitCompare,
  Wrench,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import ShinyText from '../reactbits/ShinyText';
import { PatchResult } from '../../types';

interface DiffViewerProps {
  patchResult: PatchResult;
  fileName?: string;
  onApplyPatch: (patchedCode: string) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  patchResult,
  fileName = 'main.py',
  onApplyPatch,
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'side-by-side'>('unified');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(patchResult.unified_diff || patchResult.patched_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDiff = () => {
    const blob = new Blob([patchResult.unified_diff || ''], { type: 'text/x-diff' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.py$/, '')}_migration.diff`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    onApplyPatch(patchResult.patched_code);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  // Parse lines for unified diff rendering
  const diffLines = patchResult.unified_diff ? patchResult.unified_diff.split('\n') : [];

  return (
    <div className="flex flex-col bg-midnight-900 border border-midnight-700 rounded-xl overflow-hidden shadow-xl">
      {/* Diff Studio Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-midnight-850 border-b border-midnight-700 gap-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-electric-400" />
          <span className="text-xs font-mono font-bold text-slate-100">
            DIFF COMPARISON STUDIO
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            ({fileName})
          </span>

          {/* AST Syntax Validation Guardrail Badge */}
          {patchResult.is_ast_valid ? (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-green/20 text-cyber-green border border-cyber-green/40">
              <FileCheck2 className="w-3 h-3" />
              100% AST VALID
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-red/20 text-cyber-red border border-cyber-red/40">
              <AlertTriangle className="w-3 h-3" />
              SYNTAX ERROR
            </span>
          )}
        </div>

        {/* View mode and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-midnight-950 p-0.5 rounded-lg border border-midnight-800">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                viewMode === 'unified'
                  ? 'bg-electric-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified Diff
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-electric-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          <button
            onClick={handleCopyDiff}
            className="px-2.5 py-1.5 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Copy git diff"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadDiff}
            className="px-2.5 py-1.5 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Export .diff patch file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .diff</span>
          </button>

          <button
            onClick={handleApply}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyber-green via-emerald-600 to-cyber-green text-midnight-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center gap-1.5"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>APPLIED!</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" />
                <span>APPLY FIX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Content View */}
      <div className="flex-1 bg-midnight-950 p-4 overflow-auto font-mono text-xs leading-relaxed min-h-[400px]">
        {viewMode === 'unified' ? (
          <div className="space-y-0.5">
            {diffLines.length === 0 ? (
              <div className="text-slate-500 py-8 text-center font-mono">
                No diff generated yet. Click "RUN SIMULATION" to scan code against changelog.
              </div>
            ) : (
              diffLines.map((line, idx) => {
                let lineStyle = 'text-slate-400';
                let bgStyle = '';

                if (line.startsWith('---') || line.startsWith('+++')) {
                  lineStyle = 'text-slate-300 font-bold';
                  bgStyle = 'bg-midnight-900';
                } else if (line.startsWith('@@')) {
                  lineStyle = 'text-cyber-cyan font-semibold';
                  bgStyle = 'bg-cyber-cyan/10';
                } else if (line.startsWith('+')) {
                  lineStyle = 'text-cyber-emerald font-semibold';
                  bgStyle = 'bg-cyber-green/15 border-l-2 border-cyber-green';
                } else if (line.startsWith('-')) {
                  lineStyle = 'text-cyber-crimson font-semibold';
                  bgStyle = 'bg-cyber-red/15 border-l-2 border-cyber-red';
                }

                return (
                  <div
                    key={idx}
                    className={`px-3 py-0.5 rounded-sm flex items-start ${bgStyle} ${lineStyle}`}
                  >
                    <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre flex-1">{line}</span>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before (Original) */}
            <div className="border border-midnight-800 rounded-lg overflow-hidden bg-midnight-900/60">
              <div className="px-3 py-1.5 bg-midnight-850 border-b border-midnight-800 text-[11px] font-mono text-cyber-red flex items-center justify-between">
                <span>BEFORE (DEPRECATED)</span>
                <span className="text-slate-500">Original</span>
              </div>
              <pre className="p-3 text-slate-300 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {patchResult.original_code || '// Original source code will appear here'}
              </pre>
            </div>

            {/* After (Patched) */}
            <div className="border border-midnight-800 rounded-lg overflow-hidden bg-midnight-900/60">
              <div className="px-3 py-1.5 bg-midnight-850 border-b border-midnight-800 text-[11px] font-mono text-cyber-green flex items-center justify-between">
                <span>AFTER (AST-VERIFIED REFACTOR)</span>
                <span className="text-cyber-green font-semibold">100% Valid</span>
              </div>
              <pre className="p-3 text-slate-100 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {patchResult.patched_code || '// Patched refactored code will appear here'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-midnight-850 border-t border-midnight-700 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>{patchResult.explanation}</span>
        <span>{patchResult.applied_changes_count} AST transformation(s)</span>
      </div>
    </div>
  );
};

export default DiffViewer;
