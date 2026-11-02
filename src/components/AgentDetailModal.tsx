import React, { useState } from 'react';
import { AgentId, AgentState } from '../types/agent';
import {
  X,
  Copy,
  Check,
  RotateCw,
  Code2,
  FileText,
  Layers,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface AgentDetailModalProps {
  agent: AgentState | null;
  onClose: () => void;
  onRerunAgent?: (agentId: AgentId) => void;
  canRerun: boolean;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onRerunAgent,
  canRerun,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'input' | 'prompt' | 'json'>('card');
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonString = agent.output ? JSON.stringify(agent.output, null, 2) : 'No output generated yet.';
  const inputString = agent.inputPayload ? JSON.stringify(agent.inputPayload, null, 2) : 'No input prepared yet.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${agent.accentBg}`}
            >
              #{agent.agentNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {agent.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {agent.status}
                </span>
                {agent.durationMs && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    • {(agent.durationMs / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{agent.shortRole}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canRerun && onRerunAgent && (
              <button
                onClick={() => onRerunAgent(agent.id)}
                disabled={agent.status === 'running'}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                Re-run Agent
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium">
          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 font-semibold transition ${
              activeTab === 'card'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Result Card
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 font-semibold transition ${
              activeTab === 'json'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Raw JSON
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 font-semibold transition ${
              activeTab === 'input'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Input Received
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 font-semibold transition ${
              activeTab === 'prompt'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> System Prompt
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {agent.error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Agent Execution Error</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{agent.error}</p>
              </div>
            </div>
          )}

          {/* TAB 1: FORMATTED RESULT CARD */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {!agent.output ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">No analysis result generated yet.</p>
                  <p className="text-xs mt-1">Run the workflow or this agent to see clinical and operational findings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AGENT 4 PLAN */}
                  {agent.id === 'agent4_plan' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                          Restated Goal
                        </span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">
                          {agent.output.goal}
                        </p>
                      </div>

                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Specialist Delegation Plan
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {agent.output.agents?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.agent}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.run
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {item.run ? 'Active' : 'Skipped'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{item.task}</p>
                            {item.reason && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-1">
                                Note: {item.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 1 FEEDBACK */}
                  {agent.id === 'agent1' && (
                    <div className="space-y-3">
                      {agent.output.summary && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                          <strong>Feedback Summary:</strong> {agent.output.summary}
                        </div>
                      )}
                      <div className="space-y-2.5">
                        {agent.output.comments?.map((c: any, i: number) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Comment #{c.id}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {c.theme}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    c.sentiment === 'Negative'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : c.sentiment === 'Positive'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  {c.sentiment}
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">
                              <strong className="text-slate-700 dark:text-slate-200">Process Issue:</strong> {c.operational_issue}
                            </p>
                            {c.risk_or_bias_concern && (
                              <p className="text-amber-700 dark:text-amber-400">
                                <strong>Safety / Bias Concern:</strong> {c.risk_or_bias_concern}
                              </p>
                            )}
                            <p className="text-teal-700 dark:text-teal-400 font-medium">
                              <strong>Recommended Action:</strong> {c.recommended_action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 2 MONITORING */}
                  {agent.id === 'agent2' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(agent.output.risk || {}).map(([category, level]: any) => (
                          <div
                            key={category}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                          >
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                              {category.replace('_', ' ')}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                level === 'High'
                                  ? 'text-rose-600'
                                  : level === 'Moderate'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {level} Risk
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                        <strong className="text-amber-900 dark:text-amber-300">Leadership Recommendation:</strong>{' '}
                        <span className="text-slate-700 dark:text-slate-200">{agent.output.recommendation}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Demographic & Equity Findings
                      </h4>
                      <div className="space-y-2">
                        {agent.output.equity_concerns?.map((eq: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm"
                          >
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {eq.group}:
                            </span>{' '}
                            <span className="text-slate-700 dark:text-slate-300">{eq.concern}</span>
                            <p className="text-[11px] text-slate-500 mt-1 italic">Evidence: {eq.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 3 TRIAGE */}
                  {agent.id === 'agent3' && (
                    <div className="space-y-3">
                      {agent.output.summary && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                          <strong>Triage Summary:</strong> {agent.output.summary}
                        </div>
                      )}
                      <div className="space-y-2">
                        {agent.output.complaints?.map((cmp: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs shadow-sm ${
                              cmp.human_review_required
                                ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {cmp.id} • {cmp.primary_category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    cmp.severity_level >= 3
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  }`}
                                >
                                  Level {cmp.severity_level}
                                </span>
                                {cmp.human_review_required && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                    Human Review Required
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                              <strong>Reasoning:</strong> {cmp.severity_reasoning}
                            </p>
                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                              <span>
                                <strong>Route to:</strong>{' '}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {cmp.route_to}
                                </span>
                              </span>
                              {cmp.human_review_reason && (
                                <span className="text-rose-600 dark:text-rose-400 truncate max-w-xs">
                                  {cmp.human_review_reason}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AGENT 6 COMMUNICATION */}
                  {agent.id === 'agent6' && (
                    <div className="space-y-3">
                      {agent.output.improved_patient_message && (
                        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                          <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                            Redesigned Patient Message (≤ 80 Words)
                          </span>
                          <p className="text-xs text-slate-800 dark:text-slate-100 mt-1 italic font-medium">
                            "{agent.output.improved_patient_message}"
                          </p>
                        </div>
                      )}

                      {agent.output.executive_summary && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Overall Communication Quality
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {agent.output.executive_summary.overall_quality}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-rose-500 uppercase font-bold block">
                              Highest Communication Risk
                            </span>
                            <span className="font-semibold text-rose-700 dark:text-rose-400">
                              {agent.output.executive_summary.highest_risk}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AGENT 5 ANALYTICS */}
                  {agent.id === 'agent5' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                          Executive Headline
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                          {agent.output.headline}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-1.5">
                            Quick Wins (&lt; 3 Months)
                          </h5>
                          <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300">
                            {agent.output.quick_wins?.map((qw: string, i: number) => (
                              <li key={i}>{qw}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-1.5">
                            Long-Term AI Opportunities
                          </h5>
                          <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-300">
                            {agent.output.long_term_ai_opportunities?.map((opp: string, i: number) => (
                              <li key={i}>{opp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AGENT 4 FINAL DECISION */}
                  {agent.id === 'agent4_final' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-teal-500/10 to-indigo-500/10 border border-indigo-300 dark:border-indigo-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                            Executive Alert
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            {agent.output.priority} Priority
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {agent.output.top_alert}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                          <strong>Manager Answer:</strong> {agent.output.answer}
                        </p>
                      </div>

                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Management Recommendations
                      </h4>
                      <div className="space-y-2">
                        {agent.output.recommended_actions?.map((act: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                              <span>Action #{idx + 1}</span>
                              <span className="text-teal-600 dark:text-teal-400">
                                {act.owner} • {act.timeframe}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mt-1">{act.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW JSON */}
          {activeTab === 'json' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(jsonString)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono flex items-center gap-1 z-10 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[60vh]">
                {jsonString}
              </pre>
            </div>
          )}

          {/* TAB 3: INPUT PAYLOAD */}
          {activeTab === 'input' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(inputString)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono flex items-center gap-1 z-10 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Input'}
              </button>
              <div className="mb-2 text-xs text-slate-500">
                Notice: Strict column filtering ensures this specialist receives only the exact columns required by its healthcare role.
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[60vh]">
                {inputString}
              </pre>
            </div>
          )}

          {/* TAB 4: SYSTEM PROMPT */}
          {activeTab === 'prompt' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(agent.taskPrompt)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono flex items-center gap-1 z-10 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-[60vh]">
                {agent.taskPrompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
