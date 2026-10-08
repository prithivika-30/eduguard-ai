import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  History,
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetValidationResult, DatasetOut } from '../types';

export const DataImportPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<DatasetValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importHistory, setImportHistory] = useState<DatasetOut[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await api.getDatasetHistory();
      setImportHistory(data);
    } catch (err) {
      console.error('Failed to load import history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setValidationResult(null);
      setImportSuccess(null);

      // Auto-validate on selection
      setIsValidating(true);
      try {
        const res = await api.validateDataset(file);
        setValidationResult(res);
      } catch (err: any) {
        alert(err.message || 'Validation failed');
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    try {
      const res = await api.importDataset(selectedFile);
      setImportSuccess(res.message);
      setValidationResult(null);
      setSelectedFile(null);
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Database size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Data Ingestion & Quality Validation
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Upload institutional student rosters in CSV format. Schema is validated and scored before import.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{importSuccess}</span>
          </div>
          <button
            onClick={() => setImportSuccess(null)}
            className="text-emerald-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border-2 border-dashed border-slate-800 hover:border-indigo-500/60 transition-colors text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
          <UploadCloud size={28} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Upload CSV Student Records
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Drag and drop your institutional CSV file or click browse.
            Required fields: <code>student_id, first_name, last_name, attendance_rate, average_score, recent_exam_score, assignment_completion, engagement_score</code>.
          </p>
        </div>

        <label className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/20">
          <span>{isValidating ? 'Validating CSV...' : 'Select CSV File'}</span>
          <input
            type="file"
            accept=".csv"
            disabled={isValidating}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Validation Results Panel */}
      {validationResult && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 animate-fade-in">
          {/* Quality Score Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-400">Validated File:</span>
                <span className="text-xs font-mono font-bold text-white">{validationResult.filename}</span>
                <span className="text-[11px] text-slate-400">({validationResult.total_rows} rows detected)</span>
              </div>
              <p className="text-xs text-slate-400">
                Automated data health check verified against institutional schema constraints.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Quality Index</div>
                  <div className="text-lg font-extrabold font-mono text-cyan-400">
                    {validationResult.quality_score}/100
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    validationResult.validation_status === 'Good'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : validationResult.validation_status === 'Needs Review'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {validationResult.validation_status}
                </span>
              </div>

              <button
                onClick={handleImport}
                disabled={!validationResult.is_valid || isImporting}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isImporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Confirm & Import Roster</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validationResult.checks.map((chk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
              >
                {chk.status === 'pass' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />}
                {chk.status === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />}
                {chk.status === 'fail' && <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />}

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-200 text-xs">{chk.metric}:</span>
                    <span className="text-xs text-slate-300 font-mono font-medium">{chk.value}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{chk.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sample Preview Table */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Preview (First 5 Rows)
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    {Object.keys(validationResult.sample_preview[0] || {}).map((col) => (
                      <th key={col} className="p-2.5 font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {validationResult.sample_preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="p-2.5 text-slate-300 font-mono whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Ingestion History & Audit</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">Filename</th>
                <th className="pb-3">Records</th>
                <th className="pb-3">Quality Score</th>
                <th className="pb-3">Missing Rate</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Imported At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {importHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 font-mono font-medium text-slate-200">{item.filename}</td>
                  <td className="py-3 text-slate-300">{item.row_count} rows</td>
                  <td className="py-3 font-mono text-cyan-400">{item.data_quality_score}%</td>
                  <td className="py-3 font-mono text-slate-400">{(item.missing_rate * 100).toFixed(1)}%</td>
                  <td className="py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 text-slate-400 font-mono text-[11px]">
                    {new Date(item.imported_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
