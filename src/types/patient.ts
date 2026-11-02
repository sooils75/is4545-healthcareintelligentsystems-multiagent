export interface PatientRecord {
  Record_ID: string;
  Patient_Persona: string;
  Age_Group: string;
  Visit_Type: string;
  Service_Line: string;
  Year: number;
  Patient_Satisfaction: number; // 1-10 or 1-5
  Communication_Rating: number; // 1-5
  Followup_Compliance: number; // 0 or 1
  Portal_Usage: number; // 0 or 1
  Readmission_Risk: 'Low' | 'Medium' | 'High';
  AI_Risk_Flag: string; // e.g. "Hallucination Risk", "Bias Review", "Human Review Required", "Clinical Alert", "Routine"
  Comment: string;
}

export interface DistinctComment {
  id: string;
  comment: string;
  count: number;
  avgCommunication: number;
  recordIds: string[];
  aiRiskFlags: Record<string, number>;
}

export interface GroupedMetric {
  count: number;
  avgSatisfaction: number;
  avgCommunication: number;
  followupRate: number;
  portalUsageRate: number;
  highRiskCount?: number;
}

export interface CalculatedKPIs {
  totalRecords: number;
  avgSatisfaction: number;
  avgCommunication: number;
  followupRate: number; // percentage 0-100
  portalUsageRate: number; // percentage 0-100
  satisfactionByServiceLine: Record<string, GroupedMetric>;
  satisfactionByYear: Record<string, GroupedMetric>;
  satisfactionByVisitType: Record<string, GroupedMetric>;
  satisfactionByPersona: Record<string, GroupedMetric>;
  readmissionRiskCounts: {
    Low: number;
    Medium: number;
    High: number;
  };
  aiRiskFlagCounts: Record<string, number>;
  distinctComments: DistinctComment[];
}
