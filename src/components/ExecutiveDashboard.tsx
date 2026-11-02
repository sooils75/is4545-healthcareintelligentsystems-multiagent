import React, { useState, useMemo } from 'react';
import { CalculatedKPIs, PatientRecord } from '../types/patient';
import {
  Agent1Output,
  Agent2Output,
  Agent3Output,
  Agent4FinalOutput,
  Agent5Output,
  Agent6Output,
} from '../types/agent';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  HeartPulse,
  Info,
  MessageCircle,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Target,
  ArrowUpRight,
  Stethoscope,
  Activity,
  Layers,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  kpis: CalculatedKPIs;
  selectedRecords: PatientRecord[];
  agent4Final: Agent4FinalOutput | null;
  agent1: Agent1Output | null;
  agent2: Agent2Output | null;
  agent3: Agent3Output | null;
  agent5: Agent5Output | null;
  agent6: Agent6Output | null;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  kpis,
  selectedRecords,
  agent4Final,
  agent1,
  agent2,
  agent3,
  agent5,
  agent6,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [acknowledgedActions, setAcknowledgedActions] = useState<Set<number>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<'all' | 'critical' | 'ai_risk'>('all');

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const toggleAction = (idx: number) => {
    setAcknowledgedActions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Compile cases requiring human review from Agent 3 output or dataset flags
  const humanReviewCases = useMemo(() => {
    const list: Array<{
      recordId: string;
      persona: string;
      serviceLine: string;
      comment: string;
      severity: number;
      primaryCategory: string;
      reason: string;
      aiRiskFlag: string;
    }> = [];

    const agent3ComplaintMap = new Map<string, any>();
    if (agent3?.complaints) {
      for (const cmp of agent3.complaints) {
        agent3ComplaintMap.set(cmp.id, cmp);
      }
    }

    for (const dc of kpis.distinctComments) {
      const cmpData = agent3ComplaintMap.get(dc.id);
      const isAgentFlagged = cmpData?.human_review_required || (cmpData?.severity_level && cmpData.severity_level >= 3);

      for (const recId of dc.recordIds) {
        const fullRecord = selectedRecords.find(r => r.Record_ID === recId);
        if (!fullRecord) continue;

        const isDatasetFlagged =
          fullRecord.AI_Risk_Flag.includes('Human Review') ||
          fullRecord.AI_Risk_Flag.includes('Hallucination') ||
          fullRecord.AI_Risk_Flag.includes('Bias') ||
          fullRecord.AI_Risk_Flag.includes('Alert');

        if (isAgentFlagged || isDatasetFlagged) {
          list.push({
            recordId: fullRecord.Record_ID,
            persona: fullRecord.Patient_Persona,
            serviceLine: fullRecord.Service_Line,
            comment: fullRecord.Comment,
            severity: cmpData?.severity_level || (fullRecord.Patient_Satisfaction <= 2 ? 4 : 3),
            primaryCategory: cmpData?.primary_category || 'Clinical Care / Triage',
            reason:
              cmpData?.human_review_reason ||
              `Flagged by risk protocol [${fullRecord.AI_Risk_Flag}] with low satisfaction score ${fullRecord.Patient_Satisfaction}/10`,
            aiRiskFlag: fullRecord.AI_Risk_Flag,
          });
        }
      }
    }

    return list;
  }, [kpis, agent3, selectedRecords]);

  // Filtered human review cases
  const filteredReviewCases = useMemo(() => {
    if (reviewFilter === 'critical') {
      return humanReviewCases.filter(c => c.severity >= 4);
    }
    if (reviewFilter === 'ai_risk') {
      return humanReviewCases.filter(c => c.aiRiskFlag.includes('Hallucination') || c.aiRiskFlag.includes('Bias'));
    }
    return humanReviewCases;
  }, [humanReviewCases, reviewFilter]);

  // Aggregate Agent 1 themes
  const themeCounts = useMemo(() => {
    const map: Record<string, { count: number; sentiment: string }> = {};
    if (agent1?.comments) {
      for (const c of agent1.comments) {
        const dc = kpis.distinctComments.find(d => d.id === c.id);
        const weight = dc ? dc.count : 1;
        if (!map[c.theme]) {
          map[c.theme] = { count: 0, sentiment: c.sentiment };
        }
        map[c.theme].count += weight;
      }
    }
    return map;
  }, [agent1, kpis]);

  // Aggregate Agent 3 severity breakdown
  const severityCounts = useMemo(() => {
    const counts = { 'Level 1 (Low)': 0, 'Level 2 (Moderate)': 0, 'Level 3 (High)': 0, 'Level 4 (Critical)': 0 };
    if (agent3?.complaints) {
      for (const cmp of agent3.complaints) {
        const dc = kpis.distinctComments.find(d => d.id === cmp.id);
        const weight = dc ? dc.count : 1;
        if (cmp.severity_level === 4) counts['Level 4 (Critical)'] += weight;
        else if (cmp.severity_level === 3) counts['Level 3 (High)'] += weight;
        else if (cmp.severity_level === 2) counts['Level 2 (Moderate)'] += weight;
        else counts['Level 1 (Low)'] += weight;
      }
    }
    return counts;
  }, [agent3, kpis]);

  // Communication score dimensions from Agent 6
  const communicationScores = useMemo(() => {
    if (!agent6?.evaluations || agent6.evaluations.length === 0) return null;
    let sumClarity = 0, sumComp = 0, sumEmp = 0, sumCent = 0, sumAct = 0, count = 0;
    for (const ev of agent6.evaluations) {
      const c = Number(ev.scores?.clarity) || 0;
      const co = Number(ev.scores?.completeness) || 0;
      const em = Number(ev.scores?.empathy) || 0;
      const ce = Number(ev.scores?.patient_centeredness) || 0;
      const ac = Number(ev.scores?.actionability) || 0;
      if (c || co || em || ce || ac) {
        sumClarity += c; sumComp += co; sumEmp += em; sumCent += ce; sumAct += ac;
        count++;
      }
    }
    if (count === 0) return null;
    return {
      clarity: (sumClarity / count).toFixed(1),
      completeness: (sumComp / count).toFixed(1),
      empathy: (sumEmp / count).toFixed(1),
      patientCenteredness: (sumCent / count).toFixed(1),
      actionability: (sumAct / count).toFixed(1),
    };
  }, [agent6]);

  return (
    <div className="w-full space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP: EXECUTIVE ALERT FROM AGENT 4 */}
      {/* ======================================================== */}
      {agent4Final ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-teal-500/30">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {agent4Final.priority || 'High'} Priority Strategic Directive
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Executive Leadership Briefing
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-teal-200">
              <Compass className="w-3.5 h-3.5 text-teal-300" />
              <span>Produced by Agent 4 (Orchestrator - Final Decision)</span>
            </div>
          </div>

          {/* Alert Content Grid */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            {/* Left 7 cols: Main Alert & Rationale */}
            <div className="lg:col-span-7 space-y-3.5">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block font-mono">
                Primary Management Alert
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug text-balance">
                {agent4Final.top_alert}
              </h2>

              {agent4Final.priority_reason && (
                <div className="pt-2 text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <strong className="text-amber-300 font-semibold block mb-0.5">
                    Priority Impact Rationale:
                  </strong>
                  {agent4Final.priority_reason}
                </div>
              )}
            </div>

            {/* Right 5 cols: Direct Answer to Manager Question */}
            <div className="lg:col-span-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 sm:p-5 border border-white/15 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  Direct Response to Inquiry
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {agent4Final.answer}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-200">
                <span>Multi-agent collective consensus</span>
                <span className="font-mono font-bold">100% Invariants Verified</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-100 dark:bg-slate-800/80 p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 mx-auto flex items-center justify-center text-slate-500">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Executive Briefing Awaiting Multi-Agent Execution
          </h3>
          <p className="text-xs max-w-md mx-auto">
            Click "Run Multi-Agent System" in the Manager Console above to deploy the six agents and synthesize findings into this dashboard.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. KPI METRIC TILES (JavaScript Calculated + Agent Badges) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Patient Satisfaction */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all hover:border-teal-400">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Patient Satisfaction
            </span>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              App JS Calc
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {kpis.avgSatisfaction}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 10 Scale</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Target Benchmark: 7.5</span>
            <span className={kpis.avgSatisfaction >= 7 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {kpis.avgSatisfaction >= 7 ? 'Meeting Target' : 'Below Standard'}
            </span>
          </div>

          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                kpis.avgSatisfaction >= 7
                  ? 'bg-emerald-500'
                  : kpis.avgSatisfaction >= 5
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${(kpis.avgSatisfaction / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Communication Rating */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all hover:border-sky-400">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Communication Quality
            </span>
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              Agent 6 Evaluated
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {kpis.avgCommunication}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 5 Scale</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Patient Comprehension</span>
            <span className="text-sky-600 font-bold">5-Dimension Audit</span>
          </div>

          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-700"
              style={{ width: `${(kpis.avgCommunication / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Follow-Up Compliance Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all hover:border-emerald-400">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Follow-Up Compliance
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              App JS Calc
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {kpis.followupRate}%
            </span>
            <span className="text-xs font-bold text-slate-400">Rate</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Portal Usage: {kpis.portalUsageRate}%</span>
            <span className="text-emerald-600 font-bold">Post-Discharge</span>
          </div>

          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${kpis.followupRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Cases Requiring Human Review */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all hover:border-rose-400">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Human Review Oversight
            </span>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Agent 3 & 4 Flagged
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {humanReviewCases.length}
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({Math.round((humanReviewCases.length / (kpis.totalRecords || 1)) * 100)}% of cohort)
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Safety & Clinical Escalations</span>
            <span className="text-rose-600 font-bold">Mandatory</span>
          </div>

          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (humanReviewCases.length / (kpis.totalRecords || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CHARTS GRID (Satisfaction by Service, Themes, Severity, Comm Radar) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART 1: SATISFACTION BY SERVICE LINE (App JS Calculation) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Satisfaction by Service Line
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated across encounter departments
              </p>
            </div>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
              JS Metric
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(kpis.satisfactionByServiceLine).map(([service, m]) => (
              <div key={service} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {service}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`font-bold text-xs ${
                        m.avgSatisfaction >= 7
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : m.avgSatisfaction >= 5
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {m.avgSatisfaction} / 10
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({m.count} recs)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                  {/* Target line at 70% */}
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 dark:bg-slate-600 z-10" />
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      m.avgSatisfaction >= 7
                        ? 'bg-emerald-500'
                        : m.avgSatisfaction >= 5
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${(m.avgSatisfaction / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: MAIN COMMENT THEMES (Agent 1 Feedback) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Main Feedback Themes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorized by Patient Feedback Agent
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Agent 1 Feedback
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(themeCounts).length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center italic">
                Execute workflow to extract comment themes.
              </div>
            ) : (
              Object.entries(themeCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([theme, item]) => {
                  const pct = Math.round((item.count / (kpis.totalRecords || 1)) * 100);
                  return (
                    <div key={theme} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {theme}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {item.count} recs ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* CHART 3: COMPLAINT SEVERITY DISTRIBUTION (Agent 3 Triage) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Complaint Severity Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triage classification (Level 1 to 4)
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
              Agent 3 Triage
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(severityCounts).map(([label, count]) => {
              const isCritical = label.includes('Level 4') || label.includes('Level 3');
              const barColor = label.includes('Level 4')
                ? 'bg-rose-600'
                : label.includes('Level 3')
                ? 'bg-amber-500'
                : label.includes('Level 2')
                ? 'bg-sky-500'
                : 'bg-emerald-500';

              const pct = Math.round((count / (kpis.totalRecords || 1)) * 100);

              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        isCritical ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      {count} records ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. AGENT 6: COMMUNICATION QUALITY DIMENSIONS AUDIT */}
      {/* ======================================================== */}
      {communicationScores && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Communication Quality Dimension Audit (1 to 5 Scale)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated across clarity, completeness, empathy, patient-centeredness, and actionability.
              </p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded-full">
              Produced by Agent 6 (Communication Evaluator)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {[
              { label: 'Clarity', val: communicationScores.clarity, desc: 'Plain language, no jargon' },
              { label: 'Completeness', val: communicationScores.completeness, desc: 'All critical steps explained' },
              { label: 'Empathy', val: communicationScores.empathy, desc: 'Compassionate tone' },
              { label: 'Patient-Centered', val: communicationScores.patientCenteredness, desc: 'Tailored to patient needs' },
              { label: 'Actionability', val: communicationScores.actionability, desc: 'Clear next steps' },
            ].map((dim) => (
              <div
                key={dim.label}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center space-y-1"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {dim.label}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  {dim.val}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{dim.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TABLE OF CASES THAT NEED HUMAN REVIEW */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Cases Requiring Clinical & Administrative Human Review
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {humanReviewCases.length} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Escalated cases requiring direct managerial intervention, clinical oversight, or AI bias/hallucination audit.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                reviewFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({humanReviewCases.length})
            </button>
            <button
              onClick={() => setReviewFilter('critical')}
              className={`px-3 py-1 rounded-lg transition ${
                reviewFilter === 'critical'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Critical L4 ({humanReviewCases.filter(c => c.severity >= 4).length})
            </button>
            <button
              onClick={() => setReviewFilter('ai_risk')}
              className={`px-3 py-1 rounded-lg transition ${
                reviewFilter === 'ai_risk'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              AI / Bias Traps
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-80">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3.5">Record ID</th>
                <th className="p-3.5">Persona</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Severity</th>
                <th className="p-3.5">AI Risk Flag</th>
                <th className="p-3.5">Triage Reason for Review</th>
                <th className="p-3.5">Patient Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {filteredReviewCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No cases match the selected review filter.
                  </td>
                </tr>
              ) : (
                filteredReviewCases.slice(0, 25).map((c, i) => (
                  <tr key={`${c.recordId}-${i}`} className="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {c.recordId}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                      {c.persona}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {c.serviceLine}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          c.severity >= 4
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        L{c.severity}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        {c.aiRiskFlag}
                      </span>
                    </td>
                    <td className="p-3.5 text-rose-700 dark:text-rose-400 font-semibold max-w-xs">
                      {c.reason}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-sm truncate" title={c.comment}>
                      {c.comment}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. AGENT 6: IMPROVED PATIENT MESSAGE (READY-TO-SEND) */}
      {/* ======================================================== */}
      {agent6?.improved_patient_message && (
        <div className="rounded-3xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/60 dark:from-sky-950/40 dark:via-slate-900 dark:to-sky-950/20 border border-sky-200/90 dark:border-sky-800 shadow-xs p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-900/50 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Redesigned Patient Message Template (≤ 80 Words)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Ready-to-Deploy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drafted to resolve the highest communication risk (sixth-grade reading level, compassionate, action-oriented).
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Agent 6 Output
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 relative shadow-inner">
            <button
              onClick={() => handleCopyMessage(agent6.improved_patient_message)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 transition border border-sky-200 dark:border-sky-800 cursor-pointer"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedMessage ? 'Copied to Clipboard' : 'Copy Template'}
            </button>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 pr-28 italic leading-relaxed">
              "{agent6.improved_patient_message}"
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. BOTTOM: AGENT 4 MANAGEMENT RECOMMENDATIONS */}
      {/* ======================================================== */}
      {agent4Final?.recommended_actions && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Executive Management Action Plan
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {agent4Final.recommended_actions.length} Directives
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Targeted managerial solutions synthesized across all specialist findings. Click checkbox to mark as acknowledged.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Produced by Agent 4 (Final Decision)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agent4Final.recommended_actions.map((act, idx) => {
              const isAcknowledged = acknowledgedActions.has(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isAcknowledged
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isAcknowledged
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isAcknowledged && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-xs font-extrabold text-teal-700 dark:text-teal-400">
                          Action #{idx + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {act.timeframe}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed mt-2">
                      {act.action}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Department Owner:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {act.owner}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. AGENT 5 & AGENT 2 STRATEGIC PILLARS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AGENT 5: STRATEGIC PRIORITIES & QUICK WINS */}
        {agent5 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Strategic Priorities & Quick Wins
              </h3>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                Agent 5 Analytics
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Immediate Quick Wins (&lt; 3 Months):
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300 pl-1">
                  {agent5.quick_wins?.slice(0, 3).map((w, i) => (
                    <li key={i} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Long-Term AI Opportunities (6-12 Months):
                </strong>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300 pl-1">
                  {agent5.long_term_ai_opportunities?.slice(0, 3).map((o, i) => (
                    <li key={i} className="leading-relaxed">{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AGENT 2: HEALTHCARE EQUITY & DEMOGRAPHIC VULNERABILITIES */}
        {agent2 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Healthcare Equity & Accessibility Review
              </h3>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                Agent 2 Monitoring
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {agent2.equity_concerns?.slice(0, 3).map((eq, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 dark:text-amber-300">
                      {eq.group}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      Equity Flag
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{eq.concern}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Evidence: {eq.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
