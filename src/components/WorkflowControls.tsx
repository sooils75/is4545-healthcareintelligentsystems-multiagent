import React from 'react';
import { RunMode, WorkflowStep, SpecialistTaskConfig } from '../types/agent';
import {
  Play,
  RotateCcw,
  CheckCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  RotateCw,
  HelpCircle,
  Cpu,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface WorkflowControlsProps {
  question: string;
  setQuestion: (q: string) => void;
  runMode: RunMode;
  setRunMode: (mode: RunMode) => void;
  currentStep: WorkflowStep;
  isProcessing: boolean;
  isWaitingApproval: boolean;
  onStartWorkflow: () => void;
  onApproveAndContinue: () => void;
  onResetWorkflow: () => void;
  specialistConfigs: SpecialistTaskConfig[];
  onUpdateSpecialistConfig: (agentId: string, updates: Partial<SpecialistTaskConfig>) => void;
  stepStatusText: string;
}

const PRESET_QUESTIONS = [
  {
    label: "Overall Quality & Review Cases",
    text: "What should management fix first to improve patient experience, and which cases need human review?",
  },
  {
    label: "Medication & Discharge Safety",
    text: "Which discharge instructions and medication communication breakdowns present the greatest patient safety risks?",
  },
  {
    label: "ER Wait Times & Bottlenecks",
    text: "What operational bottlenecks in Emergency Medicine are causing long wait times and severe patient dissatisfaction?",
  },
  {
    label: "Equity, Language & Accessibility",
    text: "Where are our largest equity gaps affecting older adults, limited English speakers, and patients with disabilities?",
  },
];

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  question,
  setQuestion,
  runMode,
  setRunMode,
  currentStep,
  isProcessing,
  isWaitingApproval,
  onStartWorkflow,
  onApproveAndContinue,
  onResetWorkflow,
  specialistConfigs,
  onUpdateSpecialistConfig,
  stepStatusText,
}) => {
  return (
    <section className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all space-y-6">
      {/* Console Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Manager Decision Console & Workflow Execution
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define your operational objective. Orchestrator will analyze the prompt, delegate tasks, and synthesize multi-agent findings.
          </p>
        </div>

        {/* Mode Segmented Switch */}
        <div className="flex items-center self-start md:self-auto bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRunMode('auto')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              runMode === 'auto'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Auto Run (Continuous)
          </button>
          <button
            type="button"
            onClick={() => setRunMode('step_by_step')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              runMode === 'step_by_step'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Step-by-Step Review</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          </button>
        </div>
      </div>

      {/* Inquiry Input Box */}
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="manager-inquiry" className="sr-only">
            Manager inquiry question
          </label>
          <textarea
            id="manager-inquiry"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your healthcare management question here..."
            className="w-full text-sm font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition shadow-inner resize-none leading-relaxed"
          />
          <div className="absolute right-3.5 bottom-3 text-[11px] font-mono text-slate-400 pointer-events-none">
            Gemini 3.1 Fast Input
          </div>
        </div>

        {/* Realistic Presets */}
        <div className="flex items-center flex-wrap gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Inquiries:
          </span>
          {PRESET_QUESTIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuestion(preset.text)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition border border-slate-200/80 dark:border-slate-700 cursor-pointer font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Stepper Progress Bar */}
      <div className="pt-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              currentStep === 1
                ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20 shadow-xs'
                : currentStep > 1
                ? 'border-emerald-300/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold uppercase tracking-wider">Step 01</span>
              {currentStep > 1 ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : currentStep === 1 ? (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-bold truncate">Orchestrator Planning</div>
            <div className="text-[11px] opacity-75 mt-0.5">Agent 4 delegates tasks</div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              currentStep === 2
                ? 'border-teal-500 bg-teal-50/90 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20 shadow-xs'
                : currentStep > 2
                ? 'border-emerald-300/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold uppercase tracking-wider">Step 02</span>
              {currentStep > 2 ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : currentStep === 2 ? (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-bold truncate">Parallel Specialists</div>
            <div className="text-[11px] opacity-75 mt-0.5">Agents 1, 2, 3, 6 run</div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              currentStep === 3
                ? 'border-teal-500 bg-teal-50/90 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20 shadow-xs'
                : currentStep > 3
                ? 'border-emerald-300/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold uppercase tracking-wider">Step 03</span>
              {currentStep > 3 ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : currentStep === 3 ? (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-bold truncate">Executive Analytics</div>
            <div className="text-[11px] opacity-75 mt-0.5">Agent 5 synthesizes findings</div>
          </div>

          {/* Step 4 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              currentStep === 4
                ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold uppercase tracking-wider">Step 04</span>
              {currentStep === 4 && <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div className="text-xs font-bold truncate">Final Management Decision</div>
            <div className="text-[11px] opacity-75 mt-0.5">Agent 4 acts & recommends</div>
          </div>
        </div>
      </div>

      {/* Action Bar & Dynamic Execution Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            System Status:
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {stepStatusText}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onResetWorkflow}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset System
          </button>

          {isWaitingApproval ? (
            <button
              type="button"
              onClick={onApproveAndContinue}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30 transition duration-200 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Continue to Step {currentStep + 1}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartWorkflow}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/30 ring-2 ring-teal-500/30 transition duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Executing Collaborative Workflow...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentStep > 1 && currentStep < 4 ? 'Continue Workflow' : 'Run Multi-Agent System'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* STEP 1 SPECIALIST CUSTOMIZATION PANEL (When pausing after step 1 in Step-by-Step mode) */}
      {isWaitingApproval && currentStep === 1 && (
        <div className="mt-4 p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-200/50 dark:border-indigo-800">
            <div>
              <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Step 1 Review: Orchestrator Delegation Plan
              </h3>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300 mt-0.5">
                Agent 4 has proposed the following specialist assignments. You can enable/disable agents or edit their task instructions before continuing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {specialistConfigs.map((spec) => (
              <div
                key={spec.agentId}
                className={`p-4 rounded-2xl border transition-all ${
                  spec.run
                    ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={spec.run}
                      onChange={(e) =>
                        onUpdateSpecialistConfig(spec.agentId, { run: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {spec.name}
                    </span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      spec.run
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {spec.run ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <input
                  type="text"
                  value={spec.task}
                  disabled={!spec.run}
                  onChange={(e) =>
                    onUpdateSpecialistConfig(spec.agentId, { task: e.target.value })
                  }
                  placeholder="Task instruction for this specialist..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 & 3 REVIEW NOTICE */}
      {isWaitingApproval && currentStep > 1 && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-teal-950 dark:text-teal-200 font-semibold">
            <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              Step {currentStep} completed! Inspect any agent's findings in the diagram above. If any result requires modification, you can re-run that specific agent before proceeding.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
