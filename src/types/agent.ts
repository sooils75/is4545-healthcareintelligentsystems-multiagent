export type AgentId = 'agent1' | 'agent2' | 'agent3' | 'agent4_plan' | 'agent4_final' | 'agent5' | 'agent6';

export type AgentStatus = 'pending' | 'running' | 'waiting_review' | 'completed' | 'skipped' | 'failed';

export type RunMode = 'auto' | 'step_by_step';

export type WorkflowStep = 1 | 2 | 3 | 4;

export interface SpecialistTaskConfig {
  agentId: 'agent1' | 'agent2' | 'agent3' | 'agent6';
  name: string;
  run: boolean;
  task: string;
  reason?: string;
}

// Agent 1 Output
export interface Agent1CommentResult {
  id: string;
  theme: string;
  sentiment: string;
  reasoning: string;
  operational_issue: string;
  risk_or_bias_concern: string;
  recommended_action: string;
}

export interface Agent1Output {
  comments: Agent1CommentResult[];
  summary: string;
}

// Agent 2 Output
export interface Agent2Pattern {
  pattern: string;
  evidence: string;
}

export interface Agent2EquityConcern {
  group: string;
  concern: string;
  evidence: string;
}

export interface Agent2Output {
  patterns: Agent2Pattern[];
  operational_issues: string[];
  equity_concerns: Agent2EquityConcern[];
  risk: {
    patient_safety: string;
    reputational: string;
    compliance: string;
    equity: string;
  };
  recommendation: string;
  additional_information_needed: string;
}

// Agent 3 Output
export interface Agent3ComplaintResult {
  id: string;
  primary_category: string;
  secondary_categories: string[];
  severity_level: number; // 1 to 4
  severity_reasoning: string;
  risks: Array<{ risk: string; why: string }>;
  route_to: string;
  human_review_required: boolean;
  human_review_reason: string;
}

export interface Agent3Output {
  complaints: Agent3ComplaintResult[];
  summary: string;
}

// Agent 4 Planning Output
export interface Agent4PlanAgentEntry {
  agent: string; // e.g. "Agent 1", "Agent 2", etc.
  run: boolean;
  task: string;
  reason: string;
}

export interface Agent4PlanOutput {
  goal: string;
  agents: Agent4PlanAgentEntry[];
}

// Agent 5 Output
export interface Agent5Output {
  headline: string;
  satisfaction_insights: string[];
  top_themes: string[];
  hidden_problems: Array<{ problem: string; evidence: string }>;
  ai_risk_monitoring: {
    hallucination_trap: string[];
    bias_related: string[];
    human_review: string[];
  };
  top_priorities: string[];
  quick_wins: string[];
  long_term_ai_opportunities: string[];
  additional_information_needed: string;
}

// Agent 6 Output
export interface Agent6Evaluation {
  id: string;
  purpose: string;
  purpose_rationale: string;
  scores: {
    clarity: string | number;
    completeness: string | number;
    empathy: string | number;
    patient_centeredness: string | number;
    actionability: string | number;
  };
  health_literacy_concern: string;
  risk: string;
  risk_reason: string;
  improvements: string[];
}

export interface Agent6Output {
  evaluations: Agent6Evaluation[];
  improved_patient_message: string;
  executive_summary: {
    overall_quality: string;
    major_strengths: string;
    major_weaknesses: string;
    highest_risk: string;
    most_important_improvement: string;
  };
}

// Agent 4 Final Output
export interface Agent4RecommendedAction {
  action: string;
  owner: string;
  timeframe: string;
}

export interface Agent4HumanReviewItem {
  item: string;
  reason: string;
}

export interface Agent4FinalOutput {
  top_alert: string;
  answer: string;
  priority: 'Low' | 'Medium' | 'High' | string;
  priority_reason: string;
  recommended_actions: Agent4RecommendedAction[];
  human_review: Agent4HumanReviewItem[];
}

export interface AgentState {
  id: AgentId;
  agentNumber: number;
  name: string;
  shortRole: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  status: AgentStatus;
  inputPayload: any;
  taskPrompt: string;
  output: any;
  durationMs?: number;
  error?: string;
  step: WorkflowStep;
}
