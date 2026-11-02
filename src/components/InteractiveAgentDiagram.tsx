import React from 'react';
import { AgentId, AgentState, WorkflowStep } from '../types/agent';
import {
  Compass,
  MessageSquareHeart,
  Activity,
  AlertTriangle,
  MessageCircleQuestion,
  BarChart3,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Eye,
  ArrowDown,
  ArrowUp,
  Sparkles,
  Zap,
} from 'lucide-react';

interface InteractiveAgentDiagramProps {
  agents: Record<AgentId, AgentState>;
  currentStep: WorkflowStep;
  activeTransfer: 'step1_to_specialists' | 'specialists_to_agent5' | 'agent5_to_step4' | null;
  onSelectAgent: (agentId: AgentId) => void;
  selectedAgentId: AgentId | null;
  onRerunAgent?: (agentId: AgentId) => void;
}

export const InteractiveAgentDiagram: React.FC<InteractiveAgentDiagramProps> = ({
  agents,
  currentStep,
  activeTransfer,
  onSelectAgent,
  selectedAgentId,
  onRerunAgent,
}) => {
  // Helpers for status badges
  const renderStatusBadge = (agent: AgentState) => {
    switch (agent.status) {
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 animate-pulse border border-amber-300 dark:border-amber-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-1.5" />
            Running
          </span>
        );
      case 'waiting_review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-sm">
            <Eye className="w-3 h-3 mr-1" />
            Needs Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Skipped
          </span>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
              <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
              Failed
            </span>
            {onRerunAgent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRerunAgent(agent.id);
                }}
                className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 transition flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Retry
              </button>
            )}
          </div>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'agent4_plan':
      case 'agent4_final':
        return <Compass className="w-5 h-5" />;
      case 'agent1':
        return <MessageSquareHeart className="w-5 h-5" />;
      case 'agent2':
        return <Activity className="w-5 h-5" />;
      case 'agent3':
        return <AlertTriangle className="w-5 h-5" />;
      case 'agent6':
        return <MessageCircleQuestion className="w-5 h-5" />;
      case 'agent5':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const isHighlighted = (id: AgentId) => {
    return selectedAgentId === id || agents[id]?.status === 'running';
  };

  // State checks for dynamic arrow paths
  const isDispatchActive =
    activeTransfer === 'step1_to_specialists' ||
    currentStep === 2 ||
    agents.agent1.status === 'running' ||
    agents.agent2.status === 'running' ||
    agents.agent3.status === 'running' ||
    agents.agent6.status === 'running';

  const isDispatchCompleted =
    agents.agent1.status === 'completed' ||
    agents.agent2.status === 'completed' ||
    agents.agent3.status === 'completed' ||
    agents.agent6.status === 'completed' ||
    currentStep >= 2;

  const isConvergenceActive =
    activeTransfer === 'specialists_to_agent5' ||
    currentStep === 3 ||
    agents.agent5.status === 'running';

  const isConvergenceCompleted =
    agents.agent5.status === 'completed' || currentStep >= 3;

  const isReturnLoopActive =
    activeTransfer === 'agent5_to_step4' ||
    currentStep === 4 ||
    agents.agent4_final.status === 'running';

  const isReturnLoopCompleted = agents.agent4_final.status === 'completed';

  return (
    <section className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-colors">
      {/* Diagram Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Multi-Agent Collaboration Architecture
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-teal-500 fill-teal-500 animate-pulse" />
              Dynamic Workflow Visualization
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visible workflow arrows light up as tasks are planned, dispatched to specialists, aggregated into analytics, and returned for decision support.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            Running
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Completed
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Needs Review
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            Pending
          </span>
        </div>
      </div>

      {/* Main Diagram Canvas Container with Blueprint Grid Pattern */}
      <div className="relative flex flex-col items-center max-w-5xl mx-auto bg-blueprint-grid rounded-2xl p-4 sm:p-6 border border-slate-100/80 dark:border-slate-800/80">
        {/* ======================================================== */}
        {/* TOP: AGENT 4 ORCHESTRATOR */}
        {/* ======================================================== */}
        <div className="w-full max-w-xl z-20">
          <button
            type="button"
            onClick={() => onSelectAgent(currentStep === 4 ? 'agent4_final' : 'agent4_plan')}
            className={`w-full group text-left rounded-xl p-4 transition-all duration-300 relative border-2 ${
              isHighlighted('agent4_plan') || isHighlighted('agent4_final')
                ? 'border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/20 shadow-lg bg-indigo-50/80 dark:bg-indigo-950/50 agent-running-glow'
                : 'border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-slate-800 dark:to-indigo-950/10 hover:border-indigo-400 shadow-sm'
            }`}
          >
            {/* Run Order Badge */}
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-md flex items-center gap-1.5 ring-2 ring-white dark:ring-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span>Order #1 (Plan) & #4 (Decision)</span>
            </div>

            <div className="flex items-start justify-between mt-1">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                  {getAgentIcon('agent4_plan')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Agent 4: Hospital Manager Decision Support Agent
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Orchestrator: Problem framing & specialist delegation (Plan), then executive decision synthesis (Final)
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {currentStep === 4
                  ? renderStatusBadge(agents.agent4_final)
                  : renderStatusBadge(agents.agent4_plan)}
                {agents.agent4_plan.durationMs ? (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(agents.agent4_plan.durationMs / 1000).toFixed(1)}s
                  </span>
                ) : null}
              </div>
            </div>

            {/* Orchestrator live status snippet */}
            {agents.agent4_plan.output?.goal && (
              <div className="mt-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Goal:</span>
                <span className="truncate italic">"{agents.agent4_plan.output.goal}"</span>
              </div>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* DYNAMIC WORKFLOW ARROWS 1: AGENT 4 -> 4 SPECIALISTS */}
        {/* ======================================================== */}
        <div className="w-full relative h-20 sm:h-24 my-1 flex items-center justify-center">
          {/* Dynamic SVG Branching Arrows */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrow-teal"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0d9488" />
              </marker>
              <marker
                id="arrow-emerald"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-amber"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arrow-rose"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-sky"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0ea5e9" />
              </marker>
              <marker
                id="arrow-indigo"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
              </marker>
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>

              {/* Glowing filters */}
              <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Central Stem from Agent 4 */}
            <path
              d="M 500 0 L 500 35"
              fill="none"
              stroke={isDispatchActive ? '#6366f1' : isDispatchCompleted ? '#10b981' : '#cbd5e1'}
              strokeWidth={isDispatchActive ? 3.5 : 2}
              className={isDispatchActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isDispatchActive ? '6 4' : 'none'}
              filter={isDispatchActive ? 'url(#glow-indigo)' : 'none'}
            />

            {/* Branch 1 -> Agent 1 (X=125) */}
            <path
              d="M 500 35 C 500 65, 125 45, 125 96"
              fill="none"
              stroke={
                agents.agent1.status === 'running'
                  ? '#10b981'
                  : agents.agent1.status === 'completed'
                  ? '#10b981'
                  : isDispatchActive
                  ? '#6366f1'
                  : '#cbd5e1'
              }
              strokeWidth={agents.agent1.status === 'running' ? 3.5 : 2}
              className={
                agents.agent1.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? 'animate-flow-dash'
                  : ''
              }
              strokeDasharray={
                agents.agent1.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? '8 5'
                  : 'none'
              }
              markerEnd={
                agents.agent1.status === 'completed' || agents.agent1.status === 'running'
                  ? 'url(#arrow-emerald)'
                  : isDispatchActive
                  ? 'url(#arrow-indigo)'
                  : 'url(#arrow-muted)'
              }
              filter={agents.agent1.status === 'running' ? 'url(#glow-teal)' : 'none'}
            />

            {/* Branch 2 -> Agent 2 (X=375) */}
            <path
              d="M 500 35 C 500 65, 375 50, 375 96"
              fill="none"
              stroke={
                agents.agent2.status === 'running'
                  ? '#f59e0b'
                  : agents.agent2.status === 'completed'
                  ? '#10b981'
                  : isDispatchActive
                  ? '#6366f1'
                  : '#cbd5e1'
              }
              strokeWidth={agents.agent2.status === 'running' ? 3.5 : 2}
              className={
                agents.agent2.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? 'animate-flow-dash'
                  : ''
              }
              strokeDasharray={
                agents.agent2.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? '8 5'
                  : 'none'
              }
              markerEnd={
                agents.agent2.status === 'running'
                  ? 'url(#arrow-amber)'
                  : agents.agent2.status === 'completed'
                  ? 'url(#arrow-emerald)'
                  : isDispatchActive
                  ? 'url(#arrow-indigo)'
                  : 'url(#arrow-muted)'
              }
            />

            {/* Branch 3 -> Agent 3 (X=625) */}
            <path
              d="M 500 35 C 500 65, 625 50, 625 96"
              fill="none"
              stroke={
                agents.agent3.status === 'running'
                  ? '#f43f5e'
                  : agents.agent3.status === 'completed'
                  ? '#10b981'
                  : isDispatchActive
                  ? '#6366f1'
                  : '#cbd5e1'
              }
              strokeWidth={agents.agent3.status === 'running' ? 3.5 : 2}
              className={
                agents.agent3.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? 'animate-flow-dash'
                  : ''
              }
              strokeDasharray={
                agents.agent3.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? '8 5'
                  : 'none'
              }
              markerEnd={
                agents.agent3.status === 'running'
                  ? 'url(#arrow-rose)'
                  : agents.agent3.status === 'completed'
                  ? 'url(#arrow-emerald)'
                  : isDispatchActive
                  ? 'url(#arrow-indigo)'
                  : 'url(#arrow-muted)'
              }
            />

            {/* Branch 4 -> Agent 6 (X=875) */}
            <path
              d="M 500 35 C 500 65, 875 45, 875 96"
              fill="none"
              stroke={
                agents.agent6.status === 'running'
                  ? '#0ea5e9'
                  : agents.agent6.status === 'completed'
                  ? '#10b981'
                  : isDispatchActive
                  ? '#6366f1'
                  : '#cbd5e1'
              }
              strokeWidth={agents.agent6.status === 'running' ? 3.5 : 2}
              className={
                agents.agent6.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? 'animate-flow-dash'
                  : ''
              }
              strokeDasharray={
                agents.agent6.status === 'running' || activeTransfer === 'step1_to_specialists'
                  ? '8 5'
                  : 'none'
              }
              markerEnd={
                agents.agent6.status === 'running'
                  ? 'url(#arrow-sky)'
                  : agents.agent6.status === 'completed'
                  ? 'url(#arrow-emerald)'
                  : isDispatchActive
                  ? 'url(#arrow-indigo)'
                  : 'url(#arrow-muted)'
              }
            />

            {/* Animated Travelling Data Particles when dispatch is active */}
            {isDispatchActive && (
              <>
                <circle r="4" fill="#6366f1">
                  <animateMotion
                    path="M 500 0 L 500 35 C 500 65, 125 45, 125 96"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#f59e0b">
                  <animateMotion
                    path="M 500 0 L 500 35 C 500 65, 375 50, 375 96"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#f43f5e">
                  <animateMotion
                    path="M 500 0 L 500 35 C 500 65, 625 50, 625 96"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#0ea5e9">
                  <animateMotion
                    path="M 500 0 L 500 35 C 500 65, 875 45, 875 96"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </svg>

          {/* Center Interactive Dispatch Pill */}
          <div
            className={`z-10 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all duration-300 border ${
              isDispatchActive
                ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white border-white dark:border-indigo-800 scale-105 shadow-indigo-500/25 ring-2 ring-indigo-400/40 animate-pulse'
                : isDispatchCompleted
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ArrowDown className={`w-3.5 h-3.5 ${isDispatchActive ? 'animate-bounce' : ''}`} />
            <span>
              {isDispatchActive
                ? 'Delegating Tasks to 4 Specialists'
                : isDispatchCompleted
                ? 'Tasks Dispatched & Active'
                : 'Step 1 → Step 2: Task Dispatch Flow'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MIDDLE: 4 SPECIALIST AGENTS (RUN IN PARALLEL) */}
        {/* ======================================================== */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 z-20">
          {/* Agent 1: Patient Feedback Insight */}
          <button
            type="button"
            onClick={() => onSelectAgent('agent1')}
            className={`text-left rounded-xl p-3.5 transition-all duration-300 relative border-2 ${
              isHighlighted('agent1')
                ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg bg-emerald-50/80 dark:bg-emerald-950/50 agent-running-glow scale-[1.02]'
                : 'border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20 dark:from-emerald-950/20 dark:via-slate-800 dark:to-emerald-950/10 hover:border-emerald-400 shadow-sm'
            }`}
          >
            <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
              Order #2 (Specialist)
            </div>
            <div className="flex items-start justify-between mt-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                {getAgentIcon('agent1')}
              </div>
              {renderStatusBadge(agents.agent1)}
            </div>
            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
              Agent 1: Feedback Insight
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              Theme, sentiment & operational issues from patient comments
            </p>
            {agents.agent1.output?.summary && (
              <div className="mt-2 pt-1.5 border-t border-emerald-100 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium truncate">
                ✓ {agents.agent1.output.comments?.length || 0} comments analyzed
              </div>
            )}
          </button>

          {/* Agent 2: Patient Experience Monitoring */}
          <button
            type="button"
            onClick={() => onSelectAgent('agent2')}
            className={`text-left rounded-xl p-3.5 transition-all duration-300 relative border-2 ${
              isHighlighted('agent2')
                ? 'border-amber-500 ring-4 ring-amber-500/20 shadow-lg bg-amber-50/80 dark:bg-amber-950/50 agent-running-glow scale-[1.02]'
                : 'border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 dark:from-amber-950/20 dark:via-slate-800 dark:to-amber-950/10 hover:border-amber-400 shadow-sm'
            }`}
          >
            <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
              Order #2 (Specialist)
            </div>
            <div className="flex items-start justify-between mt-1">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm">
                {getAgentIcon('agent2')}
              </div>
              {renderStatusBadge(agents.agent2)}
            </div>
            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
              Agent 2: Experience Monitoring
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              Demographic patterns, equity concerns & risk assessment
            </p>
            {agents.agent2.output?.patterns && (
              <div className="mt-2 pt-1.5 border-t border-amber-100 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-medium truncate">
                ✓ {agents.agent2.output.patterns?.length || 0} patterns identified
              </div>
            )}
          </button>

          {/* Agent 3: Complaint Triage Assistant */}
          <button
            type="button"
            onClick={() => onSelectAgent('agent3')}
            className={`text-left rounded-xl p-3.5 transition-all duration-300 relative border-2 ${
              isHighlighted('agent3')
                ? 'border-rose-500 ring-4 ring-rose-500/20 shadow-lg bg-rose-50/80 dark:bg-rose-950/50 agent-running-glow scale-[1.02]'
                : 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20 dark:from-rose-950/20 dark:via-slate-800 dark:to-rose-950/10 hover:border-rose-400 shadow-sm'
            }`}
          >
            <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
              Order #2 (Specialist)
            </div>
            <div className="flex items-start justify-between mt-1">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
                {getAgentIcon('agent3')}
              </div>
              {renderStatusBadge(agents.agent3)}
            </div>
            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
              Agent 3: Complaint Triage
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              Severity scoring (L1-L4), routing & human review oversight
            </p>
            {agents.agent3.output?.complaints && (
              <div className="mt-2 pt-1.5 border-t border-rose-100 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300 font-medium truncate">
                ✓ {agents.agent3.output.complaints?.filter((c: any) => c.human_review_required)?.length || 0} human review alerts
              </div>
            )}
          </button>

          {/* Agent 6: Healthcare Communication Evaluator */}
          <button
            type="button"
            onClick={() => onSelectAgent('agent6')}
            className={`text-left rounded-xl p-3.5 transition-all duration-300 relative border-2 ${
              isHighlighted('agent6')
                ? 'border-sky-500 ring-4 ring-sky-500/20 shadow-lg bg-sky-50/80 dark:bg-sky-950/50 agent-running-glow scale-[1.02]'
                : 'border-sky-200 dark:border-sky-900/60 bg-gradient-to-b from-sky-50/40 via-white to-sky-50/20 dark:from-sky-950/20 dark:via-slate-800 dark:to-sky-950/10 hover:border-sky-400 shadow-sm'
            }`}
          >
            <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
              Order #2 (Specialist)
            </div>
            <div className="flex items-start justify-between mt-1">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
                {getAgentIcon('agent6')}
              </div>
              {renderStatusBadge(agents.agent6)}
            </div>
            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
              Agent 6: Communication Evaluator
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              Clarity & empathy scoring + redesigned patient message
            </p>
            {agents.agent6.output?.improved_patient_message && (
              <div className="mt-2 pt-1.5 border-t border-sky-100 dark:border-sky-900/50 text-[11px] text-sky-800 dark:text-sky-300 font-medium truncate">
                ✓ Patient message drafted
              </div>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* DYNAMIC WORKFLOW ARROWS 2: 4 SPECIALISTS -> AGENT 5 */}
        {/* ======================================================== */}
        <div className="w-full relative h-20 sm:h-24 my-1 flex items-center justify-center">
          {/* Dynamic SVG Converging Arrows */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            {/* Branch from Agent 1 (X=125) -> Agent 5 (500, 65) */}
            <path
              d="M 125 0 C 125 45, 500 35, 500 65"
              fill="none"
              stroke={
                isConvergenceActive
                  ? '#14b8a6'
                  : isConvergenceCompleted
                  ? '#0d9488'
                  : '#cbd5e1'
              }
              strokeWidth={isConvergenceActive ? 3.5 : 2}
              className={isConvergenceActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isConvergenceActive ? '8 5' : 'none'}
              filter={isConvergenceActive ? 'url(#glow-teal)' : 'none'}
            />

            {/* Branch from Agent 2 (X=375) -> Agent 5 (500, 65) */}
            <path
              d="M 375 0 C 375 40, 500 35, 500 65"
              fill="none"
              stroke={
                isConvergenceActive
                  ? '#14b8a6'
                  : isConvergenceCompleted
                  ? '#0d9488'
                  : '#cbd5e1'
              }
              strokeWidth={isConvergenceActive ? 3.5 : 2}
              className={isConvergenceActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isConvergenceActive ? '8 5' : 'none'}
              filter={isConvergenceActive ? 'url(#glow-teal)' : 'none'}
            />

            {/* Branch from Agent 3 (X=625) -> Agent 5 (500, 65) */}
            <path
              d="M 625 0 C 625 40, 500 35, 500 65"
              fill="none"
              stroke={
                isConvergenceActive
                  ? '#14b8a6'
                  : isConvergenceCompleted
                  ? '#0d9488'
                  : '#cbd5e1'
              }
              strokeWidth={isConvergenceActive ? 3.5 : 2}
              className={isConvergenceActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isConvergenceActive ? '8 5' : 'none'}
              filter={isConvergenceActive ? 'url(#glow-teal)' : 'none'}
            />

            {/* Branch from Agent 6 (X=875) -> Agent 5 (500, 65) */}
            <path
              d="M 875 0 C 875 45, 500 35, 500 65"
              fill="none"
              stroke={
                isConvergenceActive
                  ? '#14b8a6'
                  : isConvergenceCompleted
                  ? '#0d9488'
                  : '#cbd5e1'
              }
              strokeWidth={isConvergenceActive ? 3.5 : 2}
              className={isConvergenceActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isConvergenceActive ? '8 5' : 'none'}
              filter={isConvergenceActive ? 'url(#glow-teal)' : 'none'}
            />

            {/* Converged Stem into Agent 5 */}
            <path
              d="M 500 65 L 500 96"
              fill="none"
              stroke={
                isConvergenceActive
                  ? '#14b8a6'
                  : isConvergenceCompleted
                  ? '#0d9488'
                  : '#cbd5e1'
              }
              strokeWidth={isConvergenceActive ? 4 : 2.5}
              className={isConvergenceActive ? 'animate-flow-dash' : ''}
              strokeDasharray={isConvergenceActive ? '8 4' : 'none'}
              markerEnd={isConvergenceActive || isConvergenceCompleted ? 'url(#arrow-teal)' : 'url(#arrow-muted)'}
              filter={isConvergenceActive ? 'url(#glow-teal)' : 'none'}
            />

            {/* Animated Travelling Convergence Particles */}
            {isConvergenceActive && (
              <>
                <circle r="4" fill="#10b981">
                  <animateMotion
                    path="M 125 0 C 125 45, 500 35, 500 96"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#f59e0b">
                  <animateMotion
                    path="M 375 0 C 375 40, 500 35, 500 96"
                    dur="1.1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#f43f5e">
                  <animateMotion
                    path="M 625 0 C 625 40, 500 35, 500 96"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="4" fill="#0ea5e9">
                  <animateMotion
                    path="M 875 0 C 875 45, 500 35, 500 96"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </svg>

          {/* Center Interactive Convergence Pill */}
          <div
            className={`z-10 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all duration-300 border ${
              isConvergenceActive
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-white dark:border-teal-800 scale-105 shadow-teal-500/25 ring-2 ring-teal-400/40 animate-pulse'
                : isConvergenceCompleted
                ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ArrowDown className={`w-3.5 h-3.5 ${isConvergenceActive ? 'animate-bounce' : ''}`} />
            <span>
              {isConvergenceActive
                ? 'Aggregating Findings into Analytics'
                : isConvergenceCompleted
                ? 'Specialist Insights Synthesized'
                : 'Step 2 → Step 3: Synthesis Flow'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM: AGENT 5 HEALTHCARE ANALYTICS */}
        {/* ======================================================== */}
        <div className="w-full max-w-xl z-20">
          <button
            type="button"
            onClick={() => onSelectAgent('agent5')}
            className={`w-full group text-left rounded-xl p-4 transition-all duration-300 relative border-2 ${
              isHighlighted('agent5')
                ? 'border-teal-500 ring-4 ring-teal-500/20 shadow-lg bg-teal-50/80 dark:bg-teal-950/50 agent-running-glow scale-[1.01]'
                : 'border-teal-200 dark:border-teal-900/60 bg-gradient-to-tr from-teal-50/40 via-white to-teal-50/20 dark:from-teal-950/20 dark:via-slate-800 dark:to-teal-950/10 hover:border-teal-400 shadow-sm'
            }`}
          >
            {/* Run Order Badge */}
            <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-bold bg-teal-600 text-white shadow-md flex items-center gap-1.5 ring-2 ring-white dark:ring-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Order #3 (Synthesis)</span>
            </div>

            <div className="flex items-start justify-between mt-1">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/30">
                  {getAgentIcon('agent5')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Agent 5: Healthcare Analytics Agent
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Synthesizes all specialist findings, KPIs, and hidden bottlenecks into executive insights
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {renderStatusBadge(agents.agent5)}
                {agents.agent5.durationMs ? (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(agents.agent5.durationMs / 1000).toFixed(1)}s
                  </span>
                ) : null}
              </div>
            </div>

            {agents.agent5.output?.headline && (
              <div className="mt-2.5 pt-2 border-t border-teal-100 dark:border-teal-900/50 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-semibold text-teal-700 dark:text-teal-400">Headline:</span>
                <span className="truncate italic">"{agents.agent5.output.headline}"</span>
              </div>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* DYNAMIC WORKFLOW RETURN ARROW: AGENT 5 BACK UP TO AGENT 4 */}
        {/* ======================================================== */}
        <div className="w-full max-w-xl mt-3 flex items-center justify-between px-2 z-20">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Closed-Loop Healthcare Quality System</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-md ${
              isReturnLoopActive
                ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 text-white border-white dark:border-indigo-800 scale-105 shadow-indigo-500/30 ring-2 ring-indigo-400/50 animate-pulse'
                : isReturnLoopCompleted
                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <ArrowUp className={`w-3.5 h-3.5 ${isReturnLoopActive ? 'animate-bounce' : ''}`} />
            <span>
              {isReturnLoopActive
                ? 'Executive Synthesis Returning to Agent 4 (#4)'
                : isReturnLoopCompleted
                ? '✓ Feedback Loop Closed: Final Decision Formulated'
                : 'Step 3 → Step 4: Return Loop to Agent 4 (Final Decision)'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
