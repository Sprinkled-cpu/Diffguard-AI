import React from 'react';
import { ShieldCheck, Cpu, Terminal, CheckCircle } from 'lucide-react';

interface FooterProps {
  totalExecutionTimeMs?: number;
  astNodesScanned?: number;
  trafficLight?: 'RED' | 'YELLOW' | 'GREEN';
}

export const Footer: React.FC<FooterProps> = ({
  totalExecutionTimeMs = 0,
  astNodesScanned = 0,
  trafficLight = 'GREEN',
}) => {
  return (
    <footer className="border-t border-midnight-700 bg-midnight-950/95 py-2 px-4 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyber-green">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            LANGGRAPH STATEGRAPH: ACTIVE
          </span>
          <span className="hidden sm:flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-electric-400" />
            PYTHON 3.13 AST ENGINE
          </span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyber-green" />
            AST SYNTAX GUARDRAIL: ENFORCED
          </span>
        </div>

        <div className="flex items-center gap-4">
          {astNodesScanned > 0 && (
            <span className="text-cyber-cyan flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              AST NODES: {astNodesScanned}
            </span>
          )}
          {totalExecutionTimeMs > 0 && (
            <span className="text-electric-300">
              PIPELINE TIME: {totalExecutionTimeMs}ms
            </span>
          )}
          <span className="text-slate-500">
            DIFFGUARD AI &copy; 2026
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
