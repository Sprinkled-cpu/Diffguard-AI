import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DecryptedText from '../components/reactbits/DecryptedText';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import ShinyText from '../components/reactbits/ShinyText';
import Header from '../components/layout/Header';
import AgentStepper from '../components/pipeline/AgentStepper';
import DiffViewer from '../components/results/DiffViewer';
import ImpactDashboard from '../components/results/ImpactDashboard';
import { PatchResult, RiskAssessment, DetectedIssue } from '../types';

describe('React Bits Components', () => {
  it('renders DecryptedText with correct content', () => {
    render(<DecryptedText text="DIFFGUARD AI" animateOn="mount" />);
    // Should render a span containing text
    expect(screen.getByText(/DIFFGUARD AI/i)).toBeInTheDocument();
  });

  it('renders SpotlightCard with children', () => {
    render(
      <SpotlightCard>
        <div>Spotlight Content</div>
      </SpotlightCard>
    );
    expect(screen.getByText('Spotlight Content')).toBeInTheDocument();
  });

  it('renders ShinyText correctly', () => {
    render(<ShinyText text="RUN SIMULATION" />);
    expect(screen.getByText('RUN SIMULATION')).toBeInTheDocument();
  });
});

describe('Header & Navigation', () => {
  it('renders brand and navigation tabs', () => {
    const onSelectTab = vi.fn();
    render(
      <Header
        crtEnabled={true}
        onToggleCrt={vi.fn()}
        activeTab="workspace"
        onSelectTab={onSelectTab}
        presets={[]}
        selectedPresetId=""
        onSelectPreset={vi.fn()}
        isRunning={false}
        onRunPipeline={vi.fn()}
      />
    );

    expect(screen.getByText(/DIFFGUARD AI/i)).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('4-Robot Stepper')).toBeInTheDocument();
    expect(screen.getByText('Diff Studio')).toBeInTheDocument();
    expect(screen.getByText('Repo Scanner')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Diff Studio'));
    expect(onSelectTab).toHaveBeenCalledWith('diff');
  });
});

describe('AgentStepper Assembly Line', () => {
  it('renders all 4 robots', () => {
    render(<AgentStepper steps={[]} isRunning={false} currentStepIndex={0} />);

    expect(screen.getByText(/Robot 1: The Fast Reader/i)).toBeInTheDocument();
    expect(screen.getByText(/Robot 2: The Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/Robot 3: The Risk Assessor/i)).toBeInTheDocument();
    expect(screen.getByText(/Robot 4: The Mechanic/i)).toBeInTheDocument();
  });
});

describe('DiffViewer & ImpactDashboard', () => {
  it('renders DiffViewer with AST validity badge and git diff', () => {
    const patchResult: PatchResult = {
      original_code: 'import stripe\nstripe.Charge.create()',
      patched_code: 'import stripe\nstripe.PaymentIntent.create()',
      unified_diff: '--- a/main.py\n+++ b/main.py\n@@ -1,2 +1,2 @@\n-stripe.Charge.create()\n+stripe.PaymentIntent.create()',
      is_ast_valid: true,
      applied_changes_count: 1,
      explanation: 'Refactored Charge.create to PaymentIntent.create',
    };

    render(
      <DiffViewer
        patchResult={patchResult}
        fileName="main.py"
        onApplyPatch={vi.fn()}
      />
    );

    expect(screen.getByText('100% AST VALID')).toBeInTheDocument();
    expect(screen.getByText('APPLY FIX')).toBeInTheDocument();
    expect(screen.getByText('Export .diff')).toBeInTheDocument();
  });

  it('renders ImpactDashboard with traffic light rating', () => {
    const assessment: RiskAssessment = {
      overall_score: 80,
      traffic_light: 'RED',
      critical_issues_count: 2,
      warning_issues_count: 1,
      safe_issues_count: 0,
      risk_summary: '2 Critical issues found',
      runtime_failure_prediction: 'Immediate runtime crash',
      affected_files: ['main.py'],
    };

    const issues: DetectedIssue[] = [
      {
        id: '1',
        file_path: 'main.py',
        line_number: 14,
        col_offset: 0,
        symbol_name: 'stripe.Charge.create',
        code_snippet: 'stripe.Charge.create()',
        change_type: 'deprecated',
        severity: 'RED',
        root_cause: 'Charge.create deprecated',
        suggested_fix: 'Use PaymentIntent.create',
        ast_node_type: 'Call',
      },
    ];

    render(<ImpactDashboard assessment={assessment} issues={issues} />);

    expect(screen.getByText('RED LIGHT')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('stripe.Charge.create')).toBeInTheDocument();
    expect(screen.getByText('Line 14')).toBeInTheDocument();
  });
});
