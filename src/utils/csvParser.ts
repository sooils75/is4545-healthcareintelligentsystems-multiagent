import { PatientRecord } from '../types/patient';

/**
 * Robust CSV parser that handles quotes, escaped quotes, and newlines
 */
export function parseCSV(csvText: string): PatientRecord[] {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++; // skip \n
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row.');
  }

  // Parse a single row into cells
  function parseRow(rowStr: string): string[] {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      if (c === '"') {
        if (inQuotes && rowStr[i + 1] === '"') {
          cell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));

  const findColIndex = (...candidates: string[]): number => {
    for (const cand of candidates) {
      const norm = cand.toLowerCase().replace(/[\s_-]+/g, '');
      const idx = headers.indexOf(norm);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = findColIndex('recordid', 'patientid', 'id');
  const personaIdx = findColIndex('patientpersona', 'persona', 'demographic');
  const ageIdx = findColIndex('agegroup', 'age');
  const visitIdx = findColIndex('visittype', 'type', 'encounter');
  const serviceIdx = findColIndex('serviceline', 'department', 'service');
  const yearIdx = findColIndex('year', 'date');
  const satIdx = findColIndex('patientsatisfaction', 'satisfaction', 'score');
  const commIdx = findColIndex('communicationrating', 'communication', 'commrating');
  const followupIdx = findColIndex('followupcompliance', 'followup', 'compliance');
  const portalIdx = findColIndex('portalusage', 'portal');
  const readmissionIdx = findColIndex('readmissionrisk', 'readmission');
  const flagIdx = findColIndex('airiskflag', 'riskflag', 'flag');
  const commentIdx = findColIndex('comment', 'feedback', 'patientcomment', 'notes');

  const records: PatientRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    if (cells.length < 2) continue;

    const satRaw = satIdx !== -1 ? parseFloat(cells[satIdx]) : 5;
    const commRaw = commIdx !== -1 ? parseFloat(cells[commIdx]) : 3;
    const followRaw = followupIdx !== -1 ? parseInt(cells[followupIdx], 10) : 1;
    const portalRaw = portalIdx !== -1 ? parseInt(cells[portalIdx], 10) : 0;
    const yearRaw = yearIdx !== -1 ? parseInt(cells[yearIdx], 10) : 2025;

    const readmRaw = readmissionIdx !== -1 ? cells[readmissionIdx] : 'Medium';
    let readmissionRisk: 'Low' | 'Medium' | 'High' = 'Medium';
    if (/high/i.test(readmRaw)) readmissionRisk = 'High';
    else if (/low/i.test(readmRaw)) readmissionRisk = 'Low';

    records.push({
      Record_ID: idIdx !== -1 && cells[idIdx] ? cells[idIdx] : `REC-${String(i).padStart(3, '0')}`,
      Patient_Persona: personaIdx !== -1 && cells[personaIdx] ? cells[personaIdx] : 'General Patient',
      Age_Group: ageIdx !== -1 && cells[ageIdx] ? cells[ageIdx] : '36-50',
      Visit_Type: visitIdx !== -1 && cells[visitIdx] ? cells[visitIdx] : 'Outpatient',
      Service_Line: serviceIdx !== -1 && cells[serviceIdx] ? cells[serviceIdx] : 'General Medicine',
      Year: isNaN(yearRaw) ? 2025 : yearRaw,
      Patient_Satisfaction: isNaN(satRaw) ? 5 : satRaw,
      Communication_Rating: isNaN(commRaw) ? 3 : commRaw,
      Followup_Compliance: isNaN(followRaw) ? 0 : (followRaw > 0 ? 1 : 0),
      Portal_Usage: isNaN(portalRaw) ? 0 : (portalRaw > 0 ? 1 : 0),
      Readmission_Risk: readmissionRisk,
      AI_Risk_Flag: flagIdx !== -1 && cells[flagIdx] ? cells[flagIdx] : 'Standard Care',
      Comment: commentIdx !== -1 && cells[commentIdx] ? cells[commentIdx] : 'No comment provided',
    });
  }

  return records;
}

/**
 * Generate CSV string from PatientRecord array
 */
export function generateCSV(records: PatientRecord[]): string {
  const headers = [
    'Record_ID',
    'Patient_Persona',
    'Age_Group',
    'Visit_Type',
    'Service_Line',
    'Year',
    'Patient_Satisfaction',
    'Communication_Rating',
    'Followup_Compliance',
    'Portal_Usage',
    'Readmission_Risk',
    'AI_Risk_Flag',
    'Comment',
  ];

  const escapeCSV = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = records.map(r => [
    escapeCSV(r.Record_ID),
    escapeCSV(r.Patient_Persona),
    escapeCSV(r.Age_Group),
    escapeCSV(r.Visit_Type),
    escapeCSV(r.Service_Line),
    r.Year,
    r.Patient_Satisfaction,
    r.Communication_Rating,
    r.Followup_Compliance,
    r.Portal_Usage,
    escapeCSV(r.Readmission_Risk),
    escapeCSV(r.AI_Risk_Flag),
    escapeCSV(r.Comment),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
