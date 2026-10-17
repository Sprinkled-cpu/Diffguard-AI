import React from 'react';
import {
  Cpu,
  Monitor,
  Terminal,
  Layers,
  GitCompare,
  FolderGit2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import DecryptedText from '../reactbits/DecryptedText';
import ShinyText from '../reactbits/ShinyText';
import { PresetScenario } from '../../types';

interface HeaderProps {
  crtEnabled: boolean;
  onToggleCrt: () => void;
  activeTab: 'workspace' | 'stepper' | 'diff' | 'repo';
  onSelectTab: (tab: 'workspace' | 'stepper' | 'diff' | 'repo') => void;
  presets: PresetScenario[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  isRunning: boolean;
  onRunPipeline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  crtEnabled,
  onToggleCrt,
  activeTab,
  onSelectTab,
  presets,
  selectedPresetId,
  onSelectPreset,
  isRunning,
  onRunPipeline,
}) => {
  return (
    <header className="border-b border-midnight-700 bg-midnight-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Retro Monitor Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-midnight-800 border border-electric-500/40 flex items-center justify-center text-electric-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 flex items-center">
                <DecryptedText
                  text="DIFFGUARD AI"
                  speed={40}
                  className="font-mono text-electric-400 font-extrabold"
                />
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-electric-500/20 text-electric-300 border border-electric-500/30 font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping inline-block" />
              THE DIGITAL MECHANIC FOR BROKEN APIS
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center bg-midnight-900 border border-midnight-700 p-1 rounded-lg">
          <button
            onClick={() => onSelectTab('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'workspace'
                ? 'bg-electric-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Workspace
          </button>
          <button
            onClick={() => onSelectTab('stepper')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'stepper'
                ? 'bg-electric-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            4-Robot Stepper
          </button>
          <button
            onClick={() => onSelectTab('diff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'diff'
                ? 'bg-electric-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Diff Studio
          </button>
          <button
            onClick={() => onSelectTab('repo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              activeTab === 'repo'
                ? 'bg-electric-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Repo Scanner
          </button>
        </nav>

        {/* Presets, CRT Toggle & Primary CTA */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-midnight-900 border border-midnight-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-electric-500 transition-colors pr-7"
            >
              <option value="">-- Load Migration Preset --</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.library}] {p.title.split(':')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* CRT Monitor Effect Toggle */}
          <button
            onClick={onToggleCrt}
            title={crtEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
              crtEnabled
                ? 'bg-cyber-green/20 border-cyber-green/50 text-cyber-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-midnight-900 border-midnight-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">CRT {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Run 4-Robot Simulation Button */}
          <button
            onClick={onRunPipeline}
            disabled={isRunning}
            className="relative group px-4 py-1.5 rounded-lg bg-gradient-to-r from-electric-600 via-indigo-600 to-electric-500 text-white font-mono text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 overflow-hidden border border-electric-400/40"
          >
            <Zap className={`w-3.5 h-3.5 text-indigo-200 ${isRunning ? 'animate-spin' : ''}`} />
            <ShinyText
              text={isRunning ? 'ANALYZING...' : 'RUN SIMULATION'}
              className="font-bold tracking-wider"
              speed={2}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
