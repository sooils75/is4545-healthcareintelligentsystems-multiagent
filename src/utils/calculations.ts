import { PatientRecord, CalculatedKPIs, DistinctComment, GroupedMetric } from '../types/patient';

/**
 * Pure JavaScript calculations for all dataset numbers.
 * The AI interprets the numbers; it does NOT recalculate them.
 */
export function calculateKPIs(records: PatientRecord[]): CalculatedKPIs {
  const total = records.length;
  if (total === 0) {
    return {
      totalRecords: 0,
      avgSatisfaction: 0,
      avgCommunication: 0,
      followupRate: 0,
      portalUsageRate: 0,
      satisfactionByServiceLine: {},
      satisfactionByYear: {},
      satisfactionByVisitType: {},
      satisfactionByPersona: {},
      readmissionRiskCounts: { Low: 0, Medium: 0, High: 0 },
      aiRiskFlagCounts: {},
      distinctComments: [],
    };
  }

  let sumSatisfaction = 0;
  let sumCommunication = 0;
  let followupCount = 0;
  let portalCount = 0;

  const readmissionRiskCounts = { Low: 0, Medium: 0, High: 0 };
  const aiRiskFlagCounts: Record<string, number> = {};

  // Group helpers
  const serviceLineMap: Record<string, { sumSat: number; sumComm: number; followup: number; portal: number; count: number }> = {};
  const yearMap: Record<string, { sumSat: number; sumComm: number; followup: number; portal: number; count: number }> = {};
  const visitTypeMap: Record<string, { sumSat: number; sumComm: number; followup: number; portal: number; count: number }> = {};
  const personaMap: Record<string, { sumSat: number; sumComm: number; followup: number; portal: number; count: number }> = {};

  // Distinct comment map: comment text -> distinct data
  const commentMap = new Map<string, {
    count: number;
    sumComm: number;
    recordIds: string[];
    aiRiskFlags: Record<string, number>;
  }>();

  for (const r of records) {
    sumSatisfaction += r.Patient_Satisfaction;
    sumCommunication += r.Communication_Rating;
    if (r.Followup_Compliance === 1) followupCount++;
    if (r.Portal_Usage === 1) portalCount++;

    // Readmission risk
    if (r.Readmission_Risk === 'High') readmissionRiskCounts.High++;
    else if (r.Readmission_Risk === 'Medium') readmissionRiskCounts.Medium++;
    else readmissionRiskCounts.Low++;

    // AI Risk Flags
    const flag = r.AI_Risk_Flag || 'Standard Care';
    aiRiskFlagCounts[flag] = (aiRiskFlagCounts[flag] || 0) + 1;

    // Service line grouping
    if (!serviceLineMap[r.Service_Line]) {
      serviceLineMap[r.Service_Line] = { sumSat: 0, sumComm: 0, followup: 0, portal: 0, count: 0 };
    }
    serviceLineMap[r.Service_Line].sumSat += r.Patient_Satisfaction;
    serviceLineMap[r.Service_Line].sumComm += r.Communication_Rating;
    if (r.Followup_Compliance === 1) serviceLineMap[r.Service_Line].followup++;
    if (r.Portal_Usage === 1) serviceLineMap[r.Service_Line].portal++;
    serviceLineMap[r.Service_Line].count++;

    // Year grouping
    const yrStr = String(r.Year);
    if (!yearMap[yrStr]) {
      yearMap[yrStr] = { sumSat: 0, sumComm: 0, followup: 0, portal: 0, count: 0 };
    }
    yearMap[yrStr].sumSat += r.Patient_Satisfaction;
    yearMap[yrStr].sumComm += r.Communication_Rating;
    if (r.Followup_Compliance === 1) yearMap[yrStr].followup++;
    if (r.Portal_Usage === 1) yearMap[yrStr].portal++;
    yearMap[yrStr].count++;

    // Visit Type grouping
    if (!visitTypeMap[r.Visit_Type]) {
      visitTypeMap[r.Visit_Type] = { sumSat: 0, sumComm: 0, followup: 0, portal: 0, count: 0 };
    }
    visitTypeMap[r.Visit_Type].sumSat += r.Patient_Satisfaction;
    visitTypeMap[r.Visit_Type].sumComm += r.Communication_Rating;
    if (r.Followup_Compliance === 1) visitTypeMap[r.Visit_Type].followup++;
    if (r.Portal_Usage === 1) visitTypeMap[r.Visit_Type].portal++;
    visitTypeMap[r.Visit_Type].count++;

    // Persona grouping
    if (!personaMap[r.Patient_Persona]) {
      personaMap[r.Patient_Persona] = { sumSat: 0, sumComm: 0, followup: 0, portal: 0, count: 0 };
    }
    personaMap[r.Patient_Persona].sumSat += r.Patient_Satisfaction;
    personaMap[r.Patient_Persona].sumComm += r.Communication_Rating;
    if (r.Followup_Compliance === 1) personaMap[r.Patient_Persona].followup++;
    if (r.Portal_Usage === 1) personaMap[r.Patient_Persona].portal++;
    personaMap[r.Patient_Persona].count++;

    // Distinct comments aggregation
    const cleanComment = (r.Comment || '').trim();
    if (cleanComment) {
      let entry = commentMap.get(cleanComment);
      if (!entry) {
        entry = {
          count: 0,
          sumComm: 0,
          recordIds: [],
          aiRiskFlags: {},
        };
        commentMap.set(cleanComment, entry);
      }
      entry.count++;
      entry.sumComm += r.Communication_Rating;
      entry.recordIds.push(r.Record_ID);
      entry.aiRiskFlags[flag] = (entry.aiRiskFlags[flag] || 0) + 1;
    }
  }

  // Convert grouped maps into GroupedMetric records
  const satisfactionByServiceLine: Record<string, GroupedMetric> = {};
  for (const [key, data] of Object.entries(serviceLineMap)) {
    satisfactionByServiceLine[key] = {
      count: data.count,
      avgSatisfaction: Number((data.sumSat / data.count).toFixed(2)),
      avgCommunication: Number((data.sumComm / data.count).toFixed(2)),
      followupRate: Math.round((data.followup / data.count) * 100),
      portalUsageRate: Math.round((data.portal / data.count) * 100),
    };
  }

  const satisfactionByYear: Record<string, GroupedMetric> = {};
  for (const [key, data] of Object.entries(yearMap)) {
    satisfactionByYear[key] = {
      count: data.count,
      avgSatisfaction: Number((data.sumSat / data.count).toFixed(2)),
      avgCommunication: Number((data.sumComm / data.count).toFixed(2)),
      followupRate: Math.round((data.followup / data.count) * 100),
      portalUsageRate: Math.round((data.portal / data.count) * 100),
    };
  }

  const satisfactionByVisitType: Record<string, GroupedMetric> = {};
  for (const [key, data] of Object.entries(visitTypeMap)) {
    satisfactionByVisitType[key] = {
      count: data.count,
      avgSatisfaction: Number((data.sumSat / data.count).toFixed(2)),
      avgCommunication: Number((data.sumComm / data.count).toFixed(2)),
      followupRate: Math.round((data.followup / data.count) * 100),
      portalUsageRate: Math.round((data.portal / data.count) * 100),
    };
  }

  const satisfactionByPersona: Record<string, GroupedMetric> = {};
  for (const [key, data] of Object.entries(personaMap)) {
    satisfactionByPersona[key] = {
      count: data.count,
      avgSatisfaction: Number((data.sumSat / data.count).toFixed(2)),
      avgCommunication: Number((data.sumComm / data.count).toFixed(2)),
      followupRate: Math.round((data.followup / data.count) * 100),
      portalUsageRate: Math.round((data.portal / data.count) * 100),
    };
  }

  // Format distinct comments
  const distinctComments: DistinctComment[] = [];
  let cIdx = 1;
  for (const [cmt, data] of commentMap.entries()) {
    distinctComments.push({
      id: `CMT-${String(cIdx).padStart(2, '0')}`,
      comment: cmt,
      count: data.count,
      avgCommunication: Number((data.sumComm / data.count).toFixed(2)),
      recordIds: data.recordIds,
      aiRiskFlags: data.aiRiskFlags,
    });
    cIdx++;
  }

  return {
    totalRecords: total,
    avgSatisfaction: Number((sumSatisfaction / total).toFixed(2)),
    avgCommunication: Number((sumCommunication / total).toFixed(2)),
    followupRate: Math.round((followupCount / total) * 100),
    portalUsageRate: Math.round((portalCount / total) * 100),
    satisfactionByServiceLine,
    satisfactionByYear,
    satisfactionByVisitType,
    satisfactionByPersona,
    readmissionRiskCounts,
    aiRiskFlagCounts,
    distinctComments,
  };
}

/**
 * Filter columns strictly for each agent according to its prompt specifications
 */
export function buildAgent1Input(kpis: CalculatedKPIs) {
  // Agent 1: distinct patient comment, its id, and number of records that contain it
  return {
    comments: kpis.distinctComments.map(dc => ({
      id: dc.id,
      comment: dc.comment,
      record_count: dc.count,
    })),
  };
}

export function buildAgent2Input(kpis: CalculatedKPIs) {
  // Agent 2: averages and counts calculated by the app, grouped by Patient_Persona, Age_Group, Visit_Type, Service_Line, and Year
  return {
    grouped_by_service_line: kpis.satisfactionByServiceLine,
    grouped_by_year: kpis.satisfactionByYear,
    grouped_by_visit_type: kpis.satisfactionByVisitType,
    grouped_by_persona: kpis.satisfactionByPersona,
    overall_readmission_risk: kpis.readmissionRiskCounts,
    comment_counts_summary: kpis.distinctComments.map(dc => ({
      id: dc.id,
      count: dc.count,
    })),
  };
}

export function buildAgent3Input(kpis: CalculatedKPIs) {
  // Agent 3: distinct patient comment, its id, number of records, and AI_Risk_Flag counts for those records
  return {
    comments: kpis.distinctComments.map(dc => ({
      id: dc.id,
      comment: dc.comment,
      record_count: dc.count,
      ai_risk_flags: dc.aiRiskFlags,
    })),
  };
}

export function buildAgent6Input(kpis: CalculatedKPIs) {
  // Agent 6: distinct patient comment, its id, number of records, and average Communication_Rating
  return {
    comments: kpis.distinctComments.map(dc => ({
      id: dc.id,
      comment: dc.comment,
      record_count: dc.count,
      average_communication_rating: dc.avgCommunication,
    })),
  };
}

export function buildAgent4PlanInput(question: string, kpis: CalculatedKPIs) {
  // Agent 4 Plan: manager's question, list of data columns available, KPIs
  return {
    manager_question: question,
    available_columns: [
      "Record_ID",
      "Patient_Persona",
      "Age_Group",
      "Visit_Type",
      "Service_Line",
      "Year",
      "Patient_Satisfaction",
      "Communication_Rating",
      "Followup_Compliance",
      "Portal_Usage",
      "Readmission_Risk",
      "AI_Risk_Flag",
      "Comment"
    ],
    kpis: {
      total_records: kpis.totalRecords,
      avg_satisfaction: kpis.avgSatisfaction,
      avg_communication_rating: kpis.avgCommunication,
      followup_compliance_rate_percent: kpis.followupRate,
      portal_usage_rate_percent: kpis.portalUsageRate,
      distinct_comment_count: kpis.distinctComments.length,
      service_lines: Object.keys(kpis.satisfactionByServiceLine),
      years: Object.keys(kpis.satisfactionByYear),
    },
  };
}

export function buildAgent5Input(kpis: CalculatedKPIs, specialistResults: {
  agent1?: any;
  agent2?: any;
  agent3?: any;
  agent6?: any;
}) {
  // Agent 5: KPIs and results from specialist agents
  return {
    kpis: {
      total_records: kpis.totalRecords,
      avg_patient_satisfaction: kpis.avgSatisfaction,
      avg_communication_rating: kpis.avgCommunication,
      followup_compliance_rate_pct: kpis.followupRate,
      portal_usage_rate_pct: kpis.portalUsageRate,
      service_line_breakdown: kpis.satisfactionByServiceLine,
      visit_type_breakdown: kpis.satisfactionByVisitType,
      persona_breakdown: kpis.satisfactionByPersona,
      year_breakdown: kpis.satisfactionByYear,
    },
    specialist_agent_results: {
      agent_1_patient_feedback: specialistResults.agent1 || "SKIPPED_OR_UNAVAILABLE",
      agent_2_experience_monitoring: specialistResults.agent2 || "SKIPPED_OR_UNAVAILABLE",
      agent_3_complaint_triage: specialistResults.agent3 || "SKIPPED_OR_UNAVAILABLE",
      agent_6_communication_evaluator: specialistResults.agent6 || "SKIPPED_OR_UNAVAILABLE",
    },
  };
}

export function buildAgent4FinalInput(
  question: string,
  plan: any,
  agent5Result: any,
  kpis: CalculatedKPIs,
  humanReviewCases: Array<{
    recordId: string;
    commentId: string;
    persona: string;
    serviceLine: string;
    reason: string;
    severity?: number;
    aiRiskFlag: string;
  }>
) {
  // Agent 4 Final: manager's question, plan, Agent 5's results, KPIs, cases flagged for human review
  return {
    manager_question: question,
    original_plan: plan,
    analytics_agent_results: agent5Result,
    kpis: {
      total_records: kpis.totalRecords,
      avg_patient_satisfaction: kpis.avgSatisfaction,
      avg_communication_rating: kpis.avgCommunication,
      followup_rate: `${kpis.followupRate}%`,
      portal_usage_rate: `${kpis.portalUsageRate}%`,
    },
    flagged_human_review_cases: humanReviewCases.slice(0, 20), // summarize top cases
  };
}
