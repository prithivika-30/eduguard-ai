import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Student } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface StudentsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    stage: 'Undergraduate',
    department: 'Computer Science',
    semester: 1,
    attendance_rate: 75.0,
    average_score: 70.0,
    recent_exam_score: 65.0,
    assignment_completion: 80.0,
    engagement_score: 65.0,
    previous_failures: 0,
  });
  const [addError, setAddError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudents({
        search,
        stage: stageFilter,
        risk: riskFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, stageFilter, riskFilter, sortBy, sortOrder]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    try {
      await api.createStudent({
        student_id: newStudent.student_id,
        first_name: newStudent.first_name,
        last_name: newStudent.last_name,
        email: newStudent.email || undefined,
        stage: newStudent.stage,
        department: newStudent.department,
        semester: Number(newStudent.semester),
        metrics: {
          attendance_rate: Number(newStudent.attendance_rate),
          average_score: Number(newStudent.average_score),
          recent_exam_score: Number(newStudent.recent_exam_score),
          assignment_completion: Number(newStudent.assignment_completion),
          engagement_score: Number(newStudent.engagement_score),
          previous_failures: Number(newStudent.previous_failures),
        },
      });
      setShowAddModal(false);
      fetchStudents();
    } catch (err: any) {
      setAddError(err.message || 'Failed to create student');
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Student Monitoring Roster
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-factor indicators, risk predictions, and intervention links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={api.getStudentsCsvUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={14} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student ID, name, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Stages</option>
            <option value="School">School</option>
            <option value="Higher Secondary">Higher Secondary</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>
        </div>

        <div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="risk_score-desc">Sort: Risk Score (Highest)</option>
            <option value="risk_score-asc">Sort: Risk Score (Lowest)</option>
            <option value="attendance-asc">Sort: Attendance (Lowest)</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Student ID & Name</th>
                <th className="py-3 px-4">Stage / Department</th>
                <th className="py-3 px-4">Attendance %</th>
                <th className="py-3 px-4">Avg Score %</th>
                <th className="py-3 px-4">Exam Score %</th>
                <th className="py-3 px-4">LMS Engage</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students matched the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  const m = stu.latest_metrics;
                  const p = stu.latest_prediction;

                  return (
                    <tr
                      key={stu.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onNavigate(`/students/${stu.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {stu.first_name} {stu.last_name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{stu.student_id}</span>
                          {stu.email && <span>• {stu.email}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium">{stu.stage}</div>
                        <div className="text-[11px] text-slate-400">{stu.department} (Sem {stu.semester})</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <span className={(m?.attendance_rate || 0) < 65 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {m ? `${m.attendance_rate}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {m ? `${m.average_score}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {m ? `${m.recent_exam_score}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {m ? `${m.engagement_score}/100` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge
                          level={p?.risk_level || 'Low'}
                          score={p?.risk_score}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onNavigate(`/students/${stu.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {students.length} student records</span>
          <span>Click any row for explainable factors & What-If simulator</span>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Add Student & Generate Risk Assessment</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Student Identifier *</label>
                  <input
                    required
                    placeholder="e.g. STU-2026-999"
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@institution.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">First Name *</label>
                  <input
                    required
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Last Name *</label>
                  <input
                    required
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Stage</label>
                  <select
                    value={newStudent.stage}
                    onChange={(e) => setNewStudent({ ...newStudent, stage: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="School">School</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Department</label>
                  <input
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 font-semibold text-slate-200">
                Initial Academic & Attendance Indicators
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Attendance Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.attendance_rate}
                    onChange={(e) => setNewStudent({ ...newStudent, attendance_rate: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Average Grade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.average_score}
                    onChange={(e) => setNewStudent({ ...newStudent, average_score: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Recent Exam (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.recent_exam_score}
                    onChange={(e) => setNewStudent({ ...newStudent, recent_exam_score: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Assignments (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.assignment_completion}
                    onChange={(e) => setNewStudent({ ...newStudent, assignment_completion: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">LMS Engagement (/100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.engagement_score}
                    onChange={(e) => setNewStudent({ ...newStudent, engagement_score: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Course Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newStudent.previous_failures}
                    onChange={(e) => setNewStudent({ ...newStudent, previous_failures: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg"
                >
                  Save & Trigger ML Prediction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
