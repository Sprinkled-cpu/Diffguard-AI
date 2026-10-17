import React, { useState } from 'react';
import { FileText, Eye, Code, Copy, Trash2, Check } from 'lucide-react';

interface ChangelogPanelProps {
  value: string;
  onChange: (val: string) => void;
}

export const ChangelogPanel: React.FC<ChangelogPanelProps> = ({ value, onChange }) => {
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value.split('\n').length;
  const charCount = value.length;

  return (
    <div className="flex flex-col h-full bg-midnight-900 border border-midnight-700 rounded-xl overflow-hidden shadow-lg">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-midnight-850 border-b border-midnight-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-electric-400" />
          <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
            API Changelog / Release Notes
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-midnight-750 text-slate-400 border border-midnight-700">
            Robot 1 Input
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewMode === 'raw'
                ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewMode === 'preview'
                ? 'bg-electric-500/20 text-electric-300 border border-electric-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preview
          </button>
          <div className="h-3 w-[1px] bg-midnight-700 mx-1" />
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Changelog"
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

      {/* Editor Content */}
      <div className="flex-1 relative overflow-auto bg-midnight-950/60 p-3 font-mono text-xs">
        {viewMode === 'raw' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste SDK release notes, API migration guide, or OpenAPI schema here..."
            className="w-full h-full min-h-[360px] bg-transparent text-slate-200 resize-none focus:outline-none placeholder:text-slate-600 leading-relaxed font-mono"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans">
            <pre className="bg-transparent p-0 text-slate-300 whitespace-pre-wrap font-mono text-xs">
              {value}
            </pre>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-midnight-850/80 border-t border-midnight-700 text-[11px] font-mono text-slate-400">
        <span>{lineCount} lines</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  );
};

export default ChangelogPanel;
