import React, { useState, useRef } from 'react';
import { PatientRecord } from '../types/patient';
import { parseCSV, downloadCSV, generateCSV } from '../utils/csvParser';
import {
  Upload,
  Download,
  Search,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface DataTableProps {
  records: PatientRecord[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUploadCSV: (newRecords: PatientRecord[]) => void;
  onResetBenchmark: () => void;
  isProcessing: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onUploadCSV,
  onResetBenchmark,
  isProcessing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const [readmissionFilter, setReadmissionFilter] = useState('ALL');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Distinct service lines and flags for filter dropdowns
  const serviceLines = Array.from(new Set(records.map(r => r.Service_Line))).sort();
  const riskFlags = Array.from(new Set(records.map(r => r.AI_Risk_Flag))).sort();

  // Filter records
  const filteredRecords = records.filter(r => {
    if (serviceFilter !== 'ALL' && r.Service_Line !== serviceFilter) return false;
    if (flagFilter !== 'ALL' && r.AI_Risk_Flag !== flagFilter) return false;
    if (readmissionFilter !== 'ALL' && r.Readmission_Risk !== readmissionFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = r.Record_ID.toLowerCase().includes(q);
      const matchComment = r.Comment.toLowerCase().includes(q);
      const matchPersona = r.Patient_Persona.toLowerCase().includes(q);
      const matchService = r.Service_Line.toLowerCase().includes(q);
      const matchFlag = r.AI_Risk_Flag.toLowerCase().includes(q);
      return matchId || matchComment || matchPersona || matchService || matchFlag;
    }
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          throw new Error('No valid patient records found in uploaded file.');
        }
        onUploadCSV(parsed);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse CSV file');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read uploaded file.');
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    const csvStr = generateCSV(records);
    downloadCSV('patient_experience_dataset.csv', csvStr);
  };

  return (
    <section id="dataset-section" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-colors space-y-5">
      {/* Table Header and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Patient Experience Dataset & Records
            </h3>
            <span className="text-xs px-3 py-1 rounded-full font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {selectedIds.size} / {records.length} Included in Active Cohort
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distinct comments are deduplicated before agent transmission and mapped back to each record in code.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
            Upload CSV
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onResetBenchmark}
            disabled={isProcessing}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Reload Benchmark
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search comments, ID, persona, service..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Service Line Filter */}
        <div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Service Lines ({serviceLines.length})</option>
            {serviceLines.map(sl => (
              <option key={sl} value={sl}>{sl}</option>
            ))}
          </select>
        </div>

        {/* AI Risk Flag Filter */}
        <div>
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All AI Risk Flags ({riskFlags.length})</option>
            {riskFlags.map(rf => (
              <option key={rf} value={rf}>{rf}</option>
            ))}
          </select>
        </div>

        {/* Readmission Risk Filter */}
        <div>
          <select
            value={readmissionFilter}
            onChange={(e) => setReadmissionFilter(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Readmission Risks</option>
            <option value="High">High Readmission Risk</option>
            <option value="Medium">Medium Readmission Risk</option>
            <option value="Low">Low Readmission Risk</option>
          </select>
        </div>
      </div>

      {/* Select All Controls */}
      <div className="flex items-center justify-between text-xs py-1 border-y border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSelectAll}
            className="hover:text-teal-600 dark:hover:text-teal-400 font-semibold flex items-center gap-1"
          >
            <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
            Select All ({records.length})
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="hover:text-rose-600 font-semibold flex items-center gap-1"
          >
            <Square className="w-3.5 h-3.5" />
            Deselect All
          </button>
        </div>

        <div>
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-96">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="p-3 w-10 text-center">Sel</th>
              <th className="p-3">Record ID</th>
              <th className="p-3">Persona & Age</th>
              <th className="p-3">Service Line & Visit</th>
              <th className="p-3 text-center">Satisfaction</th>
              <th className="p-3 text-center">Comm.</th>
              <th className="p-3 text-center">Follow-up</th>
              <th className="p-3 text-center">Portal</th>
              <th className="p-3">AI Risk Flag</th>
              <th className="p-3">Patient Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const isSelected = selectedIds.has(r.Record_ID);
                return (
                  <tr
                    key={r.Record_ID}
                    onClick={() => onToggleSelect(r.Record_ID)}
                    className={`cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                      isSelected ? 'bg-teal-50/20 dark:bg-teal-950/20' : 'opacity-60'
                    }`}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(r.Record_ID)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {r.Record_ID}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.Patient_Persona}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Age: {r.Age_Group} • Year: {r.Year}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.Service_Line}
                      </div>
                      <div className="text-[11px] text-slate-400">{r.Visit_Type}</div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          r.Patient_Satisfaction >= 7
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.Patient_Satisfaction <= 4
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {r.Patient_Satisfaction} / 10
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap font-semibold">
                      {r.Communication_Rating} / 5
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {r.Followup_Compliance === 1 ? (
                        <span className="text-emerald-600 font-bold">Yes (1)</span>
                      ) : (
                        <span className="text-rose-500 font-medium">No (0)</span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {r.Portal_Usage === 1 ? (
                        <span className="text-teal-600 font-bold">Yes (1)</span>
                      ) : (
                        <span className="text-slate-400 font-medium">No (0)</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.AI_Risk_Flag.includes('Human Review')
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : r.AI_Risk_Flag.includes('Hallucination')
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : r.AI_Risk_Flag.includes('Bias')
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {r.AI_Risk_Flag}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={r.Comment}>
                      {r.Comment}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
