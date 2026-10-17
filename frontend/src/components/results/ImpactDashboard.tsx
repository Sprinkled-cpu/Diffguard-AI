import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import { RiskAssessment, DetectedIssue } from '../../types';

interface ImpactDashboardProps {
  assessment: RiskAssessment;
  issues: DetectedIssue[];
  onSelectIssue?: (issue: DetectedIssue) => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  assessment,
  issues,
  onSelectIssue,
}) => {
  const getTrafficColor = () => {
    switch (assessment.traffic_light) {
      case 'RED':
        return 'text-cyber-red border-cyber-red/50 bg-cyber-red/10 shadow-[0_0_20px_rgba(239,68,68,0.25)]';
      case 'YELLOW':
        return 'text-cyber-amber border-cyber-amber/50 bg-cyber-amber/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]';
      case 'GREEN':
        return 'text-cyber-green border-cyber-green/50 bg-cyber-green/10 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Traffic Light Card */}
        <SpotlightCard className={`p-4 border ${getTrafficColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Crash Severity Rating
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-mono font-extrabold">
                  {assessment.traffic_light} LIGHT
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
              {assessment.traffic_light === 'RED' && <Flame className="w-6 h-6 animate-pulse" />}
              {assessment.traffic_light === 'YELLOW' && <AlertTriangle className="w-6 h-6" />}
              {assessment.traffic_light === 'GREEN' && <CheckCircle2 className="w-6 h-6" />}
            </div>
          </div>
          <p className="text-xs font-mono mt-3 text-slate-300">
            {assessment.runtime_failure_prediction}
          </p>
        </SpotlightCard>

        {/* Risk Score Gauge */}
        <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Calculated Risk Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-3xl font-mono font-extrabold ${
                assessment.overall_score >= 40
                  ? 'text-cyber-red'
                  : assessment.overall_score > 0
                  ? 'text-cyber-amber'
                  : 'text-cyber-green'
              }`}
            >
              {assessment.overall_score}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-midnight-800 rounded-full h-2 mt-3 overflow-hidden border border-midnight-700">
            <div
              className={`h-full transition-all duration-500 ${
                assessment.overall_score >= 40
                  ? 'bg-cyber-red'
                  : assessment.overall_score > 0
                  ? 'bg-cyber-amber'
                  : 'bg-cyber-green'
              }`}
              style={{ width: `${assessment.overall_score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0 SAFE</span>
            <span>50 WARNING</span>
            <span>100 FATAL</span>
          </div>
        </SpotlightCard>

        {/* Issue Counts */}
        <SpotlightCard className="p-4 border border-midnight-700 bg-midnight-900">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Identified Blast Radius
          </span>
          <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-center">
            <div className="p-2 rounded bg-midnight-850 border border-cyber-red/30">
              <span className="text-lg font-bold text-cyber-red">
                {assessment.critical_issues_count}
              </span>
              <p className="text-[10px] text-slate-400">Critical</p>
            </div>
            <div className="p-2 rounded bg-midnight-850 border border-cyber-amber/30">
              <span className="text-lg font-bold text-cyber-amber">
                {assessment.warning_issues_count}
              </span>
              <p className="text-[10px] text-slate-400">Warnings</p>
            </div>
            <div className="p-2 rounded bg-midnight-850 border border-cyber-green/30">
              <span className="text-lg font-bold text-cyber-green">
                {assessment.safe_issues_count}
              </span>
              <p className="text-[10px] text-slate-400">Safe</p>
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
            {assessment.risk_summary}
          </p>
        </SpotlightCard>
      </div>

      {/* Detected Issues List */}
      {issues.length > 0 && (
        <div className="bg-midnight-900 border border-midnight-700 rounded-xl overflow-hidden shadow-lg">
          <div className="px-4 py-2.5 bg-midnight-850 border-b border-midnight-700 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyber-amber" />
              AST Violation Registry ({issues.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Line-level AST coordinates
            </span>
          </div>

          <div className="divide-y divide-midnight-800">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 hover:bg-midnight-850/60 transition-colors cursor-pointer"
                onClick={() => onSelectIssue && onSelectIssue(issue)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          issue.severity === 'RED'
                            ? 'bg-cyber-red/20 text-cyber-crimson border border-cyber-red/30'
                            : 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {issue.symbol_name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Line {issue.line_number}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-400">
                      {issue.root_cause}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-cyber-emerald">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{issue.suggested_fix}</span>
                    </div>
                  </div>

                  {/* Code snippet pill */}
                  <pre className="hidden sm:block text-[11px] font-mono bg-midnight-950 p-2 rounded border border-midnight-800 text-slate-300 max-w-xs truncate">
                    {issue.code_snippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactDashboard;
