import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Terminal,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import SpotlightCard from '../reactbits/SpotlightCard';
import { RobotStepLog } from '../../types';

interface AgentStepperProps {
  steps: RobotStepLog[];
  isRunning: boolean;
  currentStepIndex: number;
}

const DEFAULT_ROBOTS = [
  {
    id: 1,
    name: 'Robot 1: The Fast Reader',
    role: 'Changelog Extractor',
    icon: BookOpen,
    description: 'Ingests release notes, parses OpenAPI specs, emits validated Pydantic v2 breaking API rules.',
  },
  {
    id: 2,
    name: 'Robot 2: The Inspector',
    role: 'AST Code Scanner',
    icon: Search,
    description: 'X-rays code using native Python AST (ast.NodeVisitor) & semantic embeddings to locate broken calls.',
  },
  {
    id: 3,
    name: 'Robot 3: The Risk Assessor',
    role: 'Impact Evaluator',
    icon: AlertTriangle,
    description: 'Assigns traffic-light crash rating (RED/YELLOW/GREEN) & formulates runtime failure blast radius.',
  },
  {
    id: 4,
    name: 'Robot 4: The Mechanic',
    role: 'Patch Generator & AST Guardrail',
    icon: Wrench,
    description: 'Generates unified git diffs and validates 100% syntax compliance via ast.parse().',
  },
];

export const AgentStepper: React.FC<AgentStepperProps> = ({
  steps,
  isRunning,
  currentStepIndex,
}) => {
  const [expandedRobot, setExpandedRobot] = useState<number | null>(null);

  const getRobotStatus = (index: number) => {
    const executedStep = steps.find((s) => s.robot_id === index + 1);
    if (executedStep) return executedStep.status;
    if (isRunning && currentStepIndex === index) return 'running';
    return 'idle';
  };

  const getRobotExecutionTime = (index: number) => {
    const executedStep = steps.find((s) => s.robot_id === index + 1);
    return executedStep ? executedStep.execution_time_ms : null;
  };

  const getRobotLogs = (index: number) => {
    const executedStep = steps.find((s) => s.robot_id === index + 1);
    return executedStep ? executedStep.logs : [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-electric-400 animate-ping" />
            LANGGRAPH 4-ROBOT ASSEMBLY LINE
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Sequential StateGraph pipeline transforming raw changelogs into AST-verified patches
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Status:{' '}
          <span
            className={
              isRunning
                ? 'text-electric-400 font-bold animate-pulse'
                : steps.length > 0
                ? 'text-cyber-green font-bold'
                : 'text-slate-500'
            }
          >
            {isRunning ? 'PIPELINE ENGAGED' : steps.length > 0 ? 'COMPLETED' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Assembly Line Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEFAULT_ROBOTS.map((robot, index) => {
          const status = getRobotStatus(index);
          const execTime = getRobotExecutionTime(index);
          const logs = getRobotLogs(index);
          const Icon = robot.icon;
          const isExpanded = expandedRobot === robot.id;

          return (
            <SpotlightCard
              key={robot.id}
              className={`p-4 border transition-all ${
                status === 'running'
                  ? 'border-electric-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] bg-midnight-850'
                  : status === 'completed'
                  ? 'border-cyber-green/50 shadow-[0_0_10px_rgba(16,185,129,0.15)] bg-midnight-900'
                  : 'border-midnight-700 bg-midnight-900/80 opacity-80'
              }`}
              spotlightColor={
                status === 'completed'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(99, 102, 241, 0.2)'
              }
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    status === 'completed'
                      ? 'bg-cyber-green/20 text-cyber-green'
                      : status === 'running'
                      ? 'bg-electric-500/20 text-electric-400 animate-pulse'
                      : 'bg-midnight-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Status Indicator Pill */}
                <div className="flex items-center gap-1.5">
                  {status === 'completed' && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyber-green/20 text-cyber-green border border-cyber-green/40">
                      <CheckCircle2 className="w-3 h-3" />
                      DONE
                    </span>
                  )}
                  {status === 'running' && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-300 border border-electric-500/40 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-ping" />
                      ACTIVE
                    </span>
                  )}
                  {status === 'idle' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-midnight-800 text-slate-500 border border-midnight-700">
                      QUEUED
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold text-slate-200">
                  {robot.name}
                </h3>
                <p className="text-[11px] font-mono text-electric-400">
                  {robot.role}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {robot.description}
                </p>
              </div>

              {/* Execution Time Telemetry */}
              {execTime !== null && (
                <div className="mt-3 pt-2 border-t border-midnight-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-cyber-cyan" />
                    Latency:
                  </span>
                  <span className="text-cyber-green font-semibold">{execTime} ms</span>
                </div>
              )}

              {/* Step Logs Accordion */}
              {logs.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setExpandedRobot(isExpanded ? null : robot.id)}
                    className="w-full text-left py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-between"
                  >
                    <span>View Telemetry Logs ({logs.length})</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 p-2 bg-midnight-950 rounded border border-midnight-800 font-mono text-[10px] space-y-1 text-slate-300">
                      {logs.map((log, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-electric-500 font-bold">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStepper;
