import { PatientRecord } from '../types/patient';

export const DISTINCT_COMMENTS_CATALOG = [
  {
    id: "CMT-01",
    comment: "Discharge instructions were confusing. Nobody explained when to start the new blood pressure pills or if I should stop the old ones. I called the clinic twice and only got voicemail.",
  },
  {
    id: "CMT-02",
    comment: "The surgeon and nurses were skilled, but billing sent an unexpected $3,800 charge that wasn't submitted to insurance first. Very stressful.",
  },
  {
    id: "CMT-03",
    comment: "Waited 4.5 hours in the ER triage waiting room with severe abdominal pain while newer arrivals were called. No updates or check-ins from the front desk.",
  },
  {
    id: "CMT-04",
    comment: "My mother speaks Spanish. The video interpreter machine kept freezing and crashing, so she couldn't understand the doctor's instructions for insulin.",
  },
  {
    id: "CMT-05",
    comment: "The patient portal mobile app repeatedly crashed with error code 502. I couldn't download my oncology biopsy results before my appointment.",
  },
  {
    id: "CMT-06",
    comment: "Excellent virtual visit with Dr. Martinez. She answered all my questions patiently and e-prescribed my antibiotics immediately.",
  },
  {
    id: "CMT-07",
    comment: "The clinic wheelchair ramp was blocked by delivery crates and the power door opener was broken. Had to wait outside in the rain for help.",
  },
  {
    id: "CMT-08",
    comment: "The AI symptom-checker chatbot advised me that my sudden shortness of breath was minor stress, but ER confirmed acute pulmonary embolism. This chatbot needs urgent auditing!",
  },
  {
    id: "CMT-09",
    comment: "Staff refused to offer any evening appointment slots for post-op checks. As an hourly wage worker, missing another work shift threatens my job.",
  },
  {
    id: "CMT-10",
    comment: "Nurse told me one thing about my surgical dressing changes, but the typed discharge sheet said the exact opposite. Which one am I supposed to follow?",
  },
];

// Helper to generate realistic records
export function generateBenchmarkDataset(): PatientRecord[] {
  const records: PatientRecord[] = [];

  const distributions = [
    // CMT-01: Discharge confusion (12 records)
    {
      cmtIdx: 0,
      persona: "Older Adult",
      ageGroup: "65+",
      visitType: "Inpatient",
      serviceLine: "Cardiology",
      years: [2024, 2025, 2026],
      count: 12,
      satBase: 4,
      commBase: 2,
      followup: 0,
      portal: 0,
      readmission: "High" as const,
      flag: "Human Review Required",
    },
    // CMT-02: Surprise billing (10 records)
    {
      cmtIdx: 1,
      persona: "Working Parent",
      ageGroup: "36-50",
      visitType: "Outpatient",
      serviceLine: "Orthopedics",
      years: [2024, 2025, 2026],
      count: 10,
      satBase: 5,
      commBase: 2,
      followup: 1,
      portal: 1,
      readmission: "Low" as const,
      flag: "Billing Escalation",
    },
    // CMT-03: Long ER wait (15 records)
    {
      cmtIdx: 2,
      persona: "Young Professional",
      ageGroup: "18-35",
      visitType: "Emergency",
      serviceLine: "Emergency Medicine",
      years: [2024, 2025, 2026],
      count: 15,
      satBase: 3,
      commBase: 2,
      followup: 0,
      portal: 1,
      readmission: "Medium" as const,
      flag: "Operational Bottleneck",
    },
    // CMT-04: Language interpreter failure (8 records)
    {
      cmtIdx: 3,
      persona: "Limited English Speaker",
      ageGroup: "65+",
      visitType: "Outpatient",
      serviceLine: "General Medicine",
      years: [2024, 2025, 2026],
      count: 8,
      satBase: 3,
      commBase: 1,
      followup: 0,
      portal: 0,
      readmission: "High" as const,
      flag: "Bias Review",
    },
    // CMT-05: Patient portal crash (10 records)
    {
      cmtIdx: 4,
      persona: "Chronically Ill",
      ageGroup: "51-65",
      visitType: "Outpatient",
      serviceLine: "Oncology",
      years: [2024, 2025, 2026],
      count: 10,
      satBase: 5,
      commBase: 3,
      followup: 1,
      portal: 0,
      readmission: "Medium" as const,
      flag: "Technology Failure",
    },
    // CMT-06: Telehealth positive (12 records)
    {
      cmtIdx: 5,
      persona: "Rural Patient",
      ageGroup: "36-50",
      visitType: "Telehealth",
      serviceLine: "General Medicine",
      years: [2025, 2026],
      count: 12,
      satBase: 9,
      commBase: 5,
      followup: 1,
      portal: 1,
      readmission: "Low" as const,
      flag: "Standard Care",
    },
    // CMT-07: Wheelchair accessibility (6 records)
    {
      cmtIdx: 6,
      persona: "Disability / Mobility Impaired",
      ageGroup: "51-65",
      visitType: "Outpatient",
      serviceLine: "Orthopedics",
      years: [2024, 2025],
      count: 6,
      satBase: 2,
      commBase: 2,
      followup: 1,
      portal: 1,
      readmission: "Low" as const,
      flag: "Accessibility / ADA Alert",
    },
    // CMT-08: AI Chatbot triage error (5 records)
    {
      cmtIdx: 7,
      persona: "Young Professional",
      ageGroup: "18-35",
      visitType: "Emergency",
      serviceLine: "Emergency Medicine",
      years: [2025, 2026],
      count: 5,
      satBase: 1,
      commBase: 1,
      followup: 1,
      portal: 1,
      readmission: "High" as const,
      flag: "Hallucination Risk",
    },
    // CMT-09: Scheduling equity (8 records)
    {
      cmtIdx: 8,
      persona: "Working Parent",
      ageGroup: "36-50",
      visitType: "Outpatient",
      serviceLine: "Pediatrics",
      years: [2024, 2025, 2026],
      count: 8,
      satBase: 4,
      commBase: 3,
      followup: 0,
      portal: 1,
      readmission: "Low" as const,
      flag: "Scheduling Barrier",
    },
    // CMT-10: Conflicting medication/discharge guidance (7 records)
    {
      cmtIdx: 9,
      persona: "Older Adult",
      ageGroup: "65+",
      visitType: "Inpatient",
      serviceLine: "Cardiology",
      years: [2025, 2026],
      count: 7,
      satBase: 3,
      commBase: 2,
      followup: 0,
      portal: 0,
      readmission: "High" as const,
      flag: "Human Review Required",
    },
  ];

  let recordCounter = 101;

  for (const dist of distributions) {
    const commentObj = DISTINCT_COMMENTS_CATALOG[dist.cmtIdx];
    for (let i = 0; i < dist.count; i++) {
      const year = dist.years[i % dist.years.length];
      // slight natural variation in satisfaction (±1) bounded 1-10
      const satisfaction = Math.min(10, Math.max(1, dist.satBase + ((i % 3) - 1)));
      // communication rating bounded 1-5
      const commRating = Math.min(5, Math.max(1, dist.commBase + (i % 2 === 0 ? 0 : (i % 4 === 1 ? 1 : -1))));

      // occasional followup or portal variation
      const followup = (dist.followup + (i % 4 === 3 ? 1 : 0)) % 2;
      const portal = (dist.portal + (i % 5 === 4 ? 1 : 0)) % 2;

      records.push({
        Record_ID: `REC-${recordCounter}`,
        Patient_Persona: dist.persona,
        Age_Group: dist.ageGroup,
        Visit_Type: dist.visitType,
        Service_Line: dist.serviceLine,
        Year: year,
        Patient_Satisfaction: satisfaction,
        Communication_Rating: commRating,
        Followup_Compliance: followup,
        Portal_Usage: portal,
        Readmission_Risk: dist.readmission,
        AI_Risk_Flag: dist.flag,
        Comment: commentObj.comment,
      });

      recordCounter++;
    }
  }

  return records;
}

export const INITIAL_BENCHMARK_DATASET = generateBenchmarkDataset();
