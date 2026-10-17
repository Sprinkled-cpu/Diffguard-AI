import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  FileCode2,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import { RepoScanResponse, FileScanResult } from '../../types';
import { scanRepository } from '../../services/api';

interface RepoScannerViewProps {
  changelog: string;
}

export const RepoScannerView: React.FC<RepoScannerViewProps> = ({ changelog }) => {
  const [repoPath, setRepoPath] = useState('.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<RepoScanResponse | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const handleScan = async () => {
    if (!changelog.trim()) {
      setError('Please provide a changelog or release notes in the Workspace first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await scanRepository(repoPath, changelog);
      setScanResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to scan repository');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCombined = () => {
    if (!scanResult || !scanResult.combined_patch) return;
    const blob = new Blob([scanResult.combined_patch], { type: 'text/x-diff' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repo_migration_bundle.diff`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Path Input & Scanner Trigger */}
      <div className="p-4 bg-midnight-900 border border-midnight-700 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <FolderGit2 className="w-4 h-4 text-electric-400" />
            </div>
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="Enter local repository directory path (e.g. . or ./backend)"
              className="w-full pl-9 pr-4 py-2 bg-midnight-950 border border-midnight-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-electric-500"
            />
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-electric-600 hover:bg-electric-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0"
          >
            <Search className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'SCANNING REPO...' : 'SCAN REPOSITORY'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-cyber-red/10 border border-cyber-red/30 rounded-lg text-xs font-mono text-cyber-crimson flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Matrix */}
      {scanResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Files Affected
              </span>
              <p className="text-2xl font-mono font-bold text-electric-400 mt-1">
                {scanResult.scanned_files_count}
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Breaking Calls
              </span>
              <p className="text-2xl font-mono font-bold text-cyber-red mt-1">
                {scanResult.total_issues}
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Repo Crash Status
              </span>
              <p
                className={`text-2xl font-mono font-bold mt-1 ${
                  scanResult.overall_traffic_light === 'RED'
                    ? 'text-cyber-red'
                    : scanResult.overall_traffic_light === 'YELLOW'
                    ? 'text-cyber-amber'
                    : 'text-cyber-green'
                }`}
              >
                {scanResult.overall_traffic_light}
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900 text-center flex flex-col justify-center">
              <button
                onClick={handleDownloadCombined}
                disabled={!scanResult.combined_patch}
                className="w-full py-2 px-3 rounded-lg bg-cyber-green hover:bg-emerald-500 disabled:opacity-40 text-midnight-950 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bundle (.diff)</span>
              </button>
            </SpotlightCard>
          </div>

          {/* Files List */}
          <div className="bg-midnight-900 border border-midnight-700 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-midnight-850 border-b border-midnight-700 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">
                SCANNED FILES ({scanResult.files.length})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Completed in {scanResult.execution_time_ms} ms
              </span>
            </div>

            <div className="divide-y divide-midnight-800">
              {scanResult.files.map((file) => {
                const isExpanded = expandedFile === file.relative_path;
                return (
                  <div key={file.relative_path} className="p-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedFile(isExpanded ? null : file.relative_path)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-mono font-semibold text-slate-200">
                          {file.relative_path}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            file.severity === 'RED'
                              ? 'bg-cyber-red/20 text-cyber-crimson'
                              : 'bg-cyber-amber/20 text-cyber-amber'
                          }`}
                        >
                          {file.issues_count} issue{file.issues_count > 1 ? 's' : ''}
                        </span>
                        {file.is_ast_valid && (
                          <span className="text-[10px] font-mono text-cyber-green flex items-center gap-0.5">
                            <FileCheck2 className="w-3 h-3" />
                            AST Valid
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {isExpanded && file.unified_diff && (
                      <div className="mt-3 p-3 bg-midnight-950 rounded-lg border border-midnight-800 font-mono text-xs overflow-auto max-h-72">
                        <pre className="text-slate-300 leading-relaxed whitespace-pre">
                          {file.unified_diff}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoScannerView;
