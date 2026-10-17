import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CRTEffect from './components/layout/CRTEffect';
import SplitWorkspace from './components/workspace/SplitWorkspace';
import AgentStepper from './components/pipeline/AgentStepper';
import ImpactDashboard from './components/results/ImpactDashboard';
import DiffViewer from './components/results/DiffViewer';
import RepoScannerView from './components/results/RepoScannerView';
import Squares from './components/reactbits/Squares';
import {
  PresetScenario,
  DetectedIssue,
  RiskAssessment,
  PatchResult,
  RobotStepLog,
} from './types';
import { fetchPresets, runPipeline } from './services/api';

export const App: React.FC = () => {
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'stepper' | 'diff' | 'repo'>('workspace');
  
  // Scenarios and Inputs
  const [presets, setPresets] = useState<PresetScenario[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [changelog, setChangelog] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('payment_service.py');

  // Pipeline Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>({
    overall_score: 0,
    traffic_light: 'GREEN',
    critical_issues_count: 0,
    warning_issues_count: 0,
    safe_issues_count: 0,
    risk_summary: 'System idle. Awaiting changelog and code analysis.',
    runtime_failure_prediction: 'No breaking migrations evaluated yet.',
    affected_files: [],
  });
  const [patchResult, setPatchResult] = useState<PatchResult>({
    original_code: '',
    patched_code: '',
    unified_diff: '',
    is_ast_valid: true,
    applied_changes_count: 0,
    explanation: 'No patch generated yet.',
  });
  const [robotSteps, setRobotSteps] = useState<RobotStepLog[]>([]);
  const [astNodesScanned, setAstNodesScanned] = useState<number>(0);
  const [totalExecutionTimeMs, setTotalExecutionTimeMs] = useState<number>(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const loadedPresets = await fetchPresets();
        setPresets(loadedPresets);
        if (loadedPresets.length > 0) {
          // Select first preset by default (Stripe)
          const first = loadedPresets[0];
          setSelectedPresetId(first.id);
          setChangelog(first.changelog_text);
          setSourceCode(first.sample_code);
          setFileName(first.file_name);
        }
      } catch (err: any) {
        console.error('Failed to load presets:', err);
      }
    }
    loadInitialData();
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setChangelog(found.changelog_text);
      setSourceCode(found.sample_code);
      setFileName(found.file_name);
      // Reset prior run results
      setDetectedIssues([]);
      setRobotSteps([]);
      setPatchResult({
        original_code: found.sample_code,
        patched_code: '',
        unified_diff: '',
        is_ast_valid: true,
        applied_changes_count: 0,
        explanation: 'Preset loaded. Ready for simulation run.',
      });
    }
  };

  const handleRunSimulation = async () => {
    if (!changelog.trim() || !sourceCode.trim()) {
      setErrorBanner('Please provide both changelog release notes and source code.');
      return;
    }

    setIsRunning(true);
    setErrorBanner(null);
    setCurrentStepIndex(0);

    // Simulate animated stepper progression for retro feel
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 250);

    try {
      const response = await runPipeline(changelog, sourceCode, fileName);
      clearInterval(stepInterval);

      setAstNodesScanned(response.ast_nodes_scanned);
      setDetectedIssues(response.detected_issues);
      setRiskAssessment(response.risk_assessment);
      setPatchResult(response.patch_result);
      setRobotSteps(response.robot_steps);
      setTotalExecutionTimeMs(response.total_execution_time_ms);

      // Auto-switch to diff studio or keep in workspace
      if (response.detected_issues.length > 0) {
        setActiveTab('diff');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorBanner(err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyPatch = (patchedCode: string) => {
    setSourceCode(patchedCode);
    setDetectedIssues([]);
    setRiskAssessment((prev) => ({
      ...prev,
      overall_score: 0,
      traffic_light: 'GREEN',
      critical_issues_count: 0,
      warning_issues_count: 0,
      safe_issues_count: 0,
      risk_summary: 'All breaking issues resolved and applied to source code.',
      runtime_failure_prediction: 'Safe for execution with 100% AST syntax compliance.',
    }));
  };

  return (
    <div className="relative min-h-screen bg-midnight-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-electric-500/40">
      {/* Background Animated Cybernetic Squares */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-25">
        <Squares
          speed={0.2}
          squareSize={48}
          direction="diagonal"
          borderColor="rgba(99, 102, 241, 0.15)"
          hoverFillColor="rgba(99, 102, 241, 0.2)"
        />
      </div>

      {/* CRT Scanline Overlay Effect */}
      <CRTEffect enabled={crtEnabled} />

      {/* Header Bar */}
      <Header
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        presets={presets}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        isRunning={isRunning}
        onRunPipeline={handleRunSimulation}
      />

      {/* Error Alert Banner */}
      {errorBanner && (
        <div className="relative z-30 max-w-7xl mx-auto w-full px-4 pt-3">
          <div className="p-3 bg-cyber-red/20 border border-cyber-red/50 text-cyber-crimson font-mono text-xs rounded-lg flex items-center justify-between">
            <span>ERROR: {errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        {/* Always visible horizontal assembly stepper */}
        <AgentStepper
          steps={robotSteps}
          isRunning={isRunning}
          currentStepIndex={currentStepIndex}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'workspace' && (
          <SplitWorkspace
            changelog={changelog}
            onChangelogChange={setChangelog}
            sourceCode={sourceCode}
            onSourceCodeChange={setSourceCode}
            fileName={fileName}
            onFileNameChange={setFileName}
            detectedIssues={detectedIssues}
            presets={presets}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === 'stepper' && (
          <div className="space-y-6">
            <ImpactDashboard
              assessment={riskAssessment}
              issues={detectedIssues}
            />
            {patchResult.unified_diff && (
              <DiffViewer
                patchResult={patchResult}
                fileName={fileName}
                onApplyPatch={handleApplyPatch}
              />
            )}
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-6">
            <ImpactDashboard
              assessment={riskAssessment}
              issues={detectedIssues}
            />
            <DiffViewer
              patchResult={patchResult}
              fileName={fileName}
              onApplyPatch={handleApplyPatch}
            />
          </div>
        )}

        {activeTab === 'repo' && (
          <RepoScannerView changelog={changelog} />
        )}
      </main>

      {/* Footer Telemetry */}
      <Footer
        totalExecutionTimeMs={totalExecutionTimeMs}
        astNodesScanned={astNodesScanned}
        trafficLight={riskAssessment.traffic_light}
      />
    </div>
  );
};

export default App;
