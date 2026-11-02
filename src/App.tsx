import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { InteractiveAgentDiagram } from './components/InteractiveAgentDiagram';
import { WorkflowControls } from './components/WorkflowControls';
import { DataTable } from './components/DataTable';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AgentDetailModal } from './components/AgentDetailModal';
import {
  AgentId,
  AgentState,
  RunMode,
  WorkflowStep,
  SpecialistTaskConfig,
  Agent4PlanOutput,
  Agent1Output,
  Agent2Output,
  Agent3Output,
  Agent5Output,
  Agent6Output,
  Agent4FinalOutput,
} from './types/agent';
import { PatientRecord } from './types/patient';
import { INITIAL_BENCHMARK_DATASET } from './data/benchmarkDataset';
import {
  calculateKPIs,
  buildAgent1Input,
  buildAgent2Input,
  buildAgent3Input,
  buildAgent6Input,
  buildAgent4PlanInput,
  buildAgent5Input,
  buildAgent4FinalInput,
} from './utils/calculations';
import {
  AGENT_1_FEEDBACK_PROMPT,
  AGENT_2_MONITORING_PROMPT,
  AGENT_3_TRIAGE_PROMPT,
  AGENT_4_PLAN_PROMPT,
  AGENT_5_ANALYTICS_PROMPT,
  AGENT_6_COMMUNICATION_PROMPT,
  AGENT_4_FINAL_PROMPT,
} from './data/agentPrompts';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

const INITIAL_SPECIALISTS: SpecialistTaskConfig[] = [
  {
    agentId: 'agent1',
    name: 'Agent 1: Patient Feedback Insight',
    run: true,
    task: 'Analyze patient comments to extract key operational themes, sentiments, and safety concerns.',
  },
  {
    agentId: 'agent2',
    name: 'Agent 2: Experience Monitoring',
    run: true,
    task: 'Identify demographic patterns, operational bottlenecks, and healthcare equity gaps.',
  },
  {
    agentId: 'agent3',
    name: 'Agent 3: Complaint Triage Assistant',
    run: true,
    task: 'Triage severity levels (L1-L4), detect regulatory/safety risks, and designate human review flags.',
  },
  {
    agentId: 'agent6',
    name: 'Agent 6: Communication Evaluator',
    run: true,
    task: 'Evaluate communication clarity, health literacy risks, and draft an improved patient message.',
  },
];

export default function App() {
  // Dataset state
  const [records, setRecords] = useState<PatientRecord[]>(INITIAL_BENCHMARK_DATASET);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(INITIAL_BENCHMARK_DATASET.map(r => r.Record_ID))
  );

  // Manager Question & Run Settings
  const [question, setQuestion] = useState(
    'What should management fix first to improve patient experience, and which cases need human review?'
  );
  const [runMode, setRunMode] = useState<RunMode>('step_by_step');
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [activeTransfer, setActiveTransfer] = useState<'step1_to_specialists' | 'specialists_to_agent5' | 'agent5_to_step4' | null>(null);

  // Specialist Task Configs
  const [specialistConfigs, setSpecialistConfigs] = useState<SpecialistTaskConfig[]>(INITIAL_SPECIALISTS);

  // Agent States
  const [agents, setAgents] = useState<Record<AgentId, AgentState>>({
    agent4_plan: {
      id: 'agent4_plan',
      agentNumber: 4,
      name: 'Agent 4: Decision Support (Plan)',
      shortRole: 'Lead Orchestrator: Problem framing & specialist delegation',
      accentColor: 'indigo',
      accentBg: 'bg-indigo-600',
      accentBorder: 'border-indigo-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_4_PLAN_PROMPT,
      output: null,
      step: 1,
    },
    agent1: {
      id: 'agent1',
      agentNumber: 1,
      name: 'Agent 1: Patient Feedback Insight',
      shortRole: 'Comment theme, sentiment & process problem extraction',
      accentColor: 'emerald',
      accentBg: 'bg-emerald-600',
      accentBorder: 'border-emerald-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_1_FEEDBACK_PROMPT,
      output: null,
      step: 2,
    },
    agent2: {
      id: 'agent2',
      agentNumber: 2,
      name: 'Agent 2: Experience Monitoring',
      shortRole: 'Demographic equity, longitudinal trends & operational risk',
      accentColor: 'amber',
      accentBg: 'bg-amber-600',
      accentBorder: 'border-amber-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_2_MONITORING_PROMPT,
      output: null,
      step: 2,
    },
    agent3: {
      id: 'agent3',
      agentNumber: 3,
      name: 'Agent 3: Complaint Triage Assistant',
      shortRole: 'Severity assessment (Level 1-4), routing & human oversight',
      accentColor: 'rose',
      accentBg: 'bg-rose-600',
      accentBorder: 'border-rose-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_3_TRIAGE_PROMPT,
      output: null,
      step: 2,
    },
    agent6: {
      id: 'agent6',
      agentNumber: 6,
      name: 'Agent 6: Communication Evaluator',
      shortRole: 'Health literacy, communication quality & message redesign',
      accentColor: 'sky',
      accentBg: 'bg-sky-600',
      accentBorder: 'border-sky-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_6_COMMUNICATION_PROMPT,
      output: null,
      step: 2,
    },
    agent5: {
      id: 'agent5',
      agentNumber: 5,
      name: 'Agent 5: Healthcare Analytics Agent',
      shortRole: 'Cross-specialist synthesis, hidden bottlenecks & priorities',
      accentColor: 'teal',
      accentBg: 'bg-teal-600',
      accentBorder: 'border-teal-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_5_ANALYTICS_PROMPT,
      output: null,
      step: 3,
    },
    agent4_final: {
      id: 'agent4_final',
      agentNumber: 4,
      name: 'Agent 4: Decision Support (Final)',
      shortRole: 'Executive Alert, Manager Response & Action Plan',
      accentColor: 'indigo',
      accentBg: 'bg-indigo-600',
      accentBorder: 'border-indigo-400',
      status: 'pending',
      inputPayload: null,
      taskPrompt: AGENT_4_FINAL_PROMPT,
      output: null,
      step: 4,
    },
  });

  const [selectedAgentModalId, setSelectedAgentModalId] = useState<AgentId | null>(null);

  // Selected records subset
  const selectedRecords = useMemo(() => {
    return records.filter(r => selectedIds.has(r.Record_ID));
  }, [records, selectedIds]);

  // Pure JavaScript calculations for all metrics
  const calculatedKPIs = useMemo(() => {
    return calculateKPIs(selectedRecords);
  }, [selectedRecords]);

  // Server-side LLM invoker
  const invokeAgent = async (agentId: AgentId, prompt: string, payload: any): Promise<any> => {
    setAgents(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        status: 'running',
        inputPayload: payload,
        error: undefined,
      },
    }));

    try {
      const response = await fetch('/api/agents/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentName: agents[agentId]?.name || agentId,
          prompt,
          data: payload,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to execute agent`);
      }

      setAgents(prev => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'completed',
          output: data.result,
          durationMs: data.durationMs,
        },
      }));

      return data.result;
    } catch (err: any) {
      console.error(`Error executing ${agentId}:`, err);
      setAgents(prev => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'failed',
          error: err.message || 'Execution failed',
        },
      }));
      throw err;
    }
  };

  // Step 1: Agent 4 Planning
  const runStep1Planning = async () => {
    setIsProcessing(true);
    setIsWaitingApproval(false);
    setCurrentStep(1);

    const planInput = buildAgent4PlanInput(question, calculatedKPIs);
    try {
      const planResult: Agent4PlanOutput = await invokeAgent('agent4_plan', AGENT_4_PLAN_PROMPT, planInput);

      // Apply orchestrator recommendations to specialists if returned
      if (planResult?.agents && Array.isArray(planResult.agents)) {
        setSpecialistConfigs(prev =>
          prev.map(spec => {
            const found = planResult.agents.find(
              a => a.agent.toLowerCase().includes(spec.agentId.replace('agent', 'agent ')) ||
                   a.agent.toLowerCase().includes(spec.name.toLowerCase().slice(0, 7))
            );
            if (found) {
              return {
                ...spec,
                run: found.run !== false,
                task: found.task || spec.task,
                reason: found.reason || '',
              };
            }
            return spec;
          })
        );
      }

      if (runMode === 'step_by_step') {
        setIsProcessing(false);
        setIsWaitingApproval(true);
      } else {
        // Auto mode continues to Step 2
        await runStep2Specialists();
      }
    } catch (err) {
      setIsProcessing(false);
    }
  };

  // Step 2: Parallel Specialists (Agents 1, 2, 3, 6)
  const runStep2Specialists = async () => {
    setIsProcessing(true);
    setIsWaitingApproval(false);
    setCurrentStep(2);

    setActiveTransfer('step1_to_specialists');
    await new Promise(r => setTimeout(r, 600));
    setActiveTransfer(null);

    // Filter to active specialists
    const promises: Promise<any>[] = [];

    // Agent 1
    const cfg1 = specialistConfigs.find(c => c.agentId === 'agent1');
    if (cfg1 && cfg1.run) {
      const p1 = buildAgent1Input(calculatedKPIs);
      promises.push(invokeAgent('agent1', `${AGENT_1_FEEDBACK_PROMPT}\n\nSPECIFIC TASK: ${cfg1.task}`, p1));
    } else {
      setAgents(prev => ({ ...prev, agent1: { ...prev.agent1, status: 'skipped' } }));
    }

    // Agent 2
    const cfg2 = specialistConfigs.find(c => c.agentId === 'agent2');
    if (cfg2 && cfg2.run) {
      const p2 = buildAgent2Input(calculatedKPIs);
      promises.push(invokeAgent('agent2', `${AGENT_2_MONITORING_PROMPT}\n\nSPECIFIC TASK: ${cfg2.task}`, p2));
    } else {
      setAgents(prev => ({ ...prev, agent2: { ...prev.agent2, status: 'skipped' } }));
    }

    // Agent 3
    const cfg3 = specialistConfigs.find(c => c.agentId === 'agent3');
    if (cfg3 && cfg3.run) {
      const p3 = buildAgent3Input(calculatedKPIs);
      promises.push(invokeAgent('agent3', `${AGENT_3_TRIAGE_PROMPT}\n\nSPECIFIC TASK: ${cfg3.task}`, p3));
    } else {
      setAgents(prev => ({ ...prev, agent3: { ...prev.agent3, status: 'skipped' } }));
    }

    // Agent 6
    const cfg6 = specialistConfigs.find(c => c.agentId === 'agent6');
    if (cfg6 && cfg6.run) {
      const p6 = buildAgent6Input(calculatedKPIs);
      promises.push(invokeAgent('agent6', `${AGENT_6_COMMUNICATION_PROMPT}\n\nSPECIFIC TASK: ${cfg6.task}`, p6));
    } else {
      setAgents(prev => ({ ...prev, agent6: { ...prev.agent6, status: 'skipped' } }));
    }

    // Execute in parallel
    await Promise.allSettled(promises);

    if (runMode === 'step_by_step') {
      setIsProcessing(false);
      setIsWaitingApproval(true);
    } else {
      // Auto mode continues to Step 3
      await runStep3Analytics();
    }
  };

  // Step 3: Agent 5 Analytics
  const runStep3Analytics = async () => {
    setIsProcessing(true);
    setIsWaitingApproval(false);
    setCurrentStep(3);

    setActiveTransfer('specialists_to_agent5');
    await new Promise(r => setTimeout(r, 600));
    setActiveTransfer(null);

    const specialistResults = {
      agent1: agents.agent1.output,
      agent2: agents.agent2.output,
      agent3: agents.agent3.output,
      agent6: agents.agent6.output,
    };

    const p5 = buildAgent5Input(calculatedKPIs, specialistResults);
    try {
      await invokeAgent('agent5', AGENT_5_ANALYTICS_PROMPT, p5);

      if (runMode === 'step_by_step') {
        setIsProcessing(false);
        setIsWaitingApproval(true);
      } else {
        // Auto mode continues to Step 4
        await runStep4FinalDecision();
      }
    } catch (err) {
      setIsProcessing(false);
    }
  };

  // Step 4: Agent 4 Final Decision
  const runStep4FinalDecision = async () => {
    setIsProcessing(true);
    setIsWaitingApproval(false);
    setCurrentStep(4);

    setActiveTransfer('agent5_to_step4');
    await new Promise(r => setTimeout(r, 600));
    setActiveTransfer(null);

    // Compile human review flags
    const humanReviewList = calculatedKPIs.distinctComments
      .filter(dc => {
        const cmp = agents.agent3.output?.complaints?.find((c: any) => c.id === dc.id);
        return cmp?.human_review_required || (cmp?.severity_level && cmp.severity_level >= 3);
      })
      .map(dc => {
        const cmp = agents.agent3.output?.complaints?.find((c: any) => c.id === dc.id);
        return {
          recordId: dc.recordIds[0] || dc.id,
          commentId: dc.id,
          persona: 'Flagged Cohort',
          serviceLine: 'Hospital Wide',
          reason: cmp?.human_review_reason || 'High severity patient safety/equity flag',
          severity: cmp?.severity_level || 3,
          aiRiskFlag: Object.keys(dc.aiRiskFlags).join(', '),
        };
      });

    const p4Final = buildAgent4FinalInput(
      question,
      agents.agent4_plan.output,
      agents.agent5.output,
      calculatedKPIs,
      humanReviewList
    );

    try {
      await invokeAgent('agent4_final', AGENT_4_FINAL_PROMPT, p4Final);
    } catch (err) {
      console.error('Final decision error:', err);
    } finally {
      setIsProcessing(false);
      setIsWaitingApproval(false);
    }
  };

  // Workflow Handlers
  const handleStartWorkflow = () => {
    if (currentStep === 1 || agents.agent4_final.status === 'completed') {
      runStep1Planning();
    } else if (currentStep === 2) {
      runStep2Specialists();
    } else if (currentStep === 3) {
      runStep3Analytics();
    } else if (currentStep === 4) {
      runStep4FinalDecision();
    }
  };

  const handleApproveAndContinue = () => {
    if (currentStep === 1) {
      runStep2Specialists();
    } else if (currentStep === 2) {
      runStep3Analytics();
    } else if (currentStep === 3) {
      runStep4FinalDecision();
    }
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setIsProcessing(false);
    setIsWaitingApproval(false);
    setActiveTransfer(null);
    setSpecialistConfigs(INITIAL_SPECIALISTS);
    setAgents(prev => {
      const resetObj = { ...prev };
      (Object.keys(resetObj) as AgentId[]).forEach(id => {
        resetObj[id] = {
          ...resetObj[id],
          status: 'pending',
          inputPayload: null,
          output: null,
          durationMs: undefined,
          error: undefined,
        };
      });
      return resetObj;
    });
  };

  // Re-run single agent without repeating other completed agents
  const handleRerunSingleAgent = async (agentId: AgentId) => {
    if (isProcessing) return;

    if (agentId === 'agent4_plan') {
      const planInput = buildAgent4PlanInput(question, calculatedKPIs);
      await invokeAgent('agent4_plan', AGENT_4_PLAN_PROMPT, planInput);
    } else if (agentId === 'agent1') {
      const cfg = specialistConfigs.find(c => c.agentId === 'agent1');
      const p = buildAgent1Input(calculatedKPIs);
      await invokeAgent('agent1', `${AGENT_1_FEEDBACK_PROMPT}\n\nSPECIFIC TASK: ${cfg?.task || ''}`, p);
    } else if (agentId === 'agent2') {
      const cfg = specialistConfigs.find(c => c.agentId === 'agent2');
      const p = buildAgent2Input(calculatedKPIs);
      await invokeAgent('agent2', `${AGENT_2_MONITORING_PROMPT}\n\nSPECIFIC TASK: ${cfg?.task || ''}`, p);
    } else if (agentId === 'agent3') {
      const cfg = specialistConfigs.find(c => c.agentId === 'agent3');
      const p = buildAgent3Input(calculatedKPIs);
      await invokeAgent('agent3', `${AGENT_3_TRIAGE_PROMPT}\n\nSPECIFIC TASK: ${cfg?.task || ''}`, p);
    } else if (agentId === 'agent6') {
      const cfg = specialistConfigs.find(c => c.agentId === 'agent6');
      const p = buildAgent6Input(calculatedKPIs);
      await invokeAgent('agent6', `${AGENT_6_COMMUNICATION_PROMPT}\n\nSPECIFIC TASK: ${cfg?.task || ''}`, p);
    } else if (agentId === 'agent5') {
      const specialistResults = {
        agent1: agents.agent1.output,
        agent2: agents.agent2.output,
        agent3: agents.agent3.output,
        agent6: agents.agent6.output,
      };
      const p5 = buildAgent5Input(calculatedKPIs, specialistResults);
      await invokeAgent('agent5', AGENT_5_ANALYTICS_PROMPT, p5);
    } else if (agentId === 'agent4_final') {
      await runStep4FinalDecision();
    }
  };

  // Data selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(records.map(r => r.Record_ID)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleUploadCSV = (newRecords: PatientRecord[]) => {
    setRecords(newRecords);
    setSelectedIds(new Set(newRecords.map(r => r.Record_ID)));
    handleResetWorkflow();
  };

  const handleResetBenchmark = () => {
    setRecords(INITIAL_BENCHMARK_DATASET);
    setSelectedIds(new Set(INITIAL_BENCHMARK_DATASET.map(r => r.Record_ID)));
    handleResetWorkflow();
  };

  // Status text for workflow controls
  const stepStatusText = useMemo(() => {
    if (isProcessing) return `Executing Step ${currentStep}...`;
    if (isWaitingApproval) return `Step ${currentStep} Paused for Manager Review`;
    if (agents.agent4_final.status === 'completed') return 'Workflow Complete • Dashboard Active';
    return 'Ready to Run Multi-Agent System';
  }, [isProcessing, isWaitingApproval, currentStep, agents.agent4_final.status]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
        {/* Header */}
        <Header
          totalRecords={records.length}
          selectedCount={selectedIds.size}
          runMode={runMode}
          onReset={handleResetWorkflow}
          onLoadBenchmark={handleResetBenchmark}
          activeStep={currentStep}
          isProcessing={isProcessing}
          onNavigateSection={(sectionId) => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        />

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
          {/* 1. INTERACTIVE AGENT DIAGRAM */}
          <div id="architecture-section">
            <InteractiveAgentDiagram
              agents={agents}
              currentStep={currentStep}
              activeTransfer={activeTransfer}
              onSelectAgent={(id) => setSelectedAgentModalId(id)}
              selectedAgentId={selectedAgentModalId}
              onRerunAgent={handleRerunSingleAgent}
            />
          </div>

          {/* 2. WORKFLOW CONTROLS & STEPPER */}
          <div id="workflow-section">
            <WorkflowControls
              question={question}
              setQuestion={setQuestion}
              runMode={runMode}
              setRunMode={setRunMode}
              currentStep={currentStep}
              isProcessing={isProcessing}
              isWaitingApproval={isWaitingApproval}
              onStartWorkflow={handleStartWorkflow}
              onApproveAndContinue={handleApproveAndContinue}
              onResetWorkflow={handleResetWorkflow}
              specialistConfigs={specialistConfigs}
              onUpdateSpecialistConfig={(agentId, updates) =>
                setSpecialistConfigs(prev =>
                  prev.map(c => (c.agentId === agentId ? { ...c, ...updates } : c))
                )
              }
              stepStatusText={stepStatusText}
            />
          </div>

          {/* 3. EXECUTIVE DASHBOARD */}
          <div id="dashboard-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Executive Management Dashboard</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Combined intelligence and actionable findings synthesized by the six collaborative agents.
                </p>
              </div>
            </div>

            <ExecutiveDashboard
              kpis={calculatedKPIs}
              selectedRecords={selectedRecords}
              agent4Final={agents.agent4_final.output}
              agent1={agents.agent1.output}
              agent2={agents.agent2.output}
              agent3={agents.agent3.output}
              agent5={agents.agent5.output}
              agent6={agents.agent6.output}
            />
          </div>

          {/* 4. PATIENT EXPERIENCE DATASET & RECORDS TABLE */}
          <DataTable
            records={records}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onUploadCSV={handleUploadCSV}
            onResetBenchmark={handleResetBenchmark}
            isProcessing={isProcessing}
          />
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-6 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div>
              <strong>Hospital Patient Experience Intelligence System</strong> • Six Collaborative AI Agents
            </div>
            <div>
              Synthetic data for quality improvement demonstration • Gemini 3.8 Flash Engine
            </div>
          </div>
        </footer>

        {/* AGENT DETAIL INSPECTION MODAL */}
        <AgentDetailModal
          agent={selectedAgentModalId ? agents[selectedAgentModalId] : null}
          onClose={() => setSelectedAgentModalId(null)}
          onRerunAgent={handleRerunSingleAgent}
          canRerun={!isProcessing}
        />
      </div>
    </ThemeProvider>
  );
}
