import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Shield,
  Clock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  TrendingDown,
  Layers,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { StudentDetail, WhatIfResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';
import { FactorsList } from '../components/common/FactorsList';

interface StudentDetailPageProps {
  studentId: number;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  studentId,
  onBack,
  onNavigate,
}) => {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Embedded What-If Simulator state
  const [simAttendance, setSimAttendance] = useState<number>(75);
  const [simAvgScore, setSimAvgScore] = useState<number>(70);
  const [simRecentExam, setSimRecentExam] = useState<number>(65);
  const [simAssignments, setSimAssignments] = useState<number>(80);
  const [simEngagement, setSimEngagement] = useState<number>(65);
  const [simFailures, setSimFailures] = useState<number>(0);
  const [simResult, setSimResult] = useState<WhatIfResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // New Intervention Modal State
  const [showInterventionModal, setShowInterventionModal] = useState<boolean>(false);
  const [intervCategory, setIntervCategory] = useState<string>('Academic Support');
  const [intervPriority, setIntervPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [intervTitle, setIntervTitle] = useState<string>('');
  const [intervActionPlan, setIntervActionPlan] = useState<string>('');
  const [intervDueDate, setIntervDueDate] = useState<string>('');
  const [intervFollowupDate, setIntervFollowupDate] = useState<string>('');
  const [intervNotes, setIntervNotes] = useState<string>('');

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStudent(studentId);
      setStudent(data);

      const latestM = data.metrics_history[0];
      if (latestM) {
        setSimAttendance(latestM.attendance_rate);
        setSimAvgScore(latestM.average_score);
        setSimRecentExam(latestM.recent_exam_score);
        setSimAssignments(latestM.assignment_completion);
        setSimEngagement(latestM.engagement_score);
        setSimFailures(latestM.previous_failures);
      }
    } catch (err) {
      console.error('Failed to load student detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const handleRunWhatIf = async () => {
    setIsSimulating(true);
    try {
      const res = await api.runWhatIf({
        student_id: studentId,
        attendance_rate: simAttendance,
        average_score: simAvgScore,
        recent_exam_score: simRecentExam,
        assignment_completion: simAssignments,
        engagement_score: simEngagement,
        previous_failures: simFailures,
      });
      setSimResult(res);
    } catch (err) {
      console.error('What-if failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIntervention({
        student_id: studentId,
        category: intervCategory,
        priority: intervPriority,
        title: intervTitle,
        action_plan: intervActionPlan,
        due_date: intervDueDate || new Date().toISOString().split('T')[0],
        followup_date: intervFollowupDate || undefined,
        notes: intervNotes,
        status: 'In Progress',
      });
      setShowInterventionModal(false);
      fetchStudent();
    } catch (err) {
      console.error('Failed to create intervention', err);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading student profile & predictions...</span>
        </div>
      </div>
    );
  }

  const latestPrediction = student.predictions_history[0];
  const latestMetrics = student.metrics_history[0];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Students</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInterventionModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus size={14} />
            <span>Create Intervention</span>
          </button>
        </div>
      </div>

      {/* Student Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30 shrink-0">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {student.first_name} {student.last_name}
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {student.student_id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                {student.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Department: <strong className="text-slate-200">{student.department}</strong> • Semester {student.semester} • Enrolled {student.enrollment_year} • {student.email || 'No email on file'}
            </p>
          </div>
        </div>

        {/* Current Risk Badge Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-4 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Dropout Risk Level
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge
                level={latestPrediction?.risk_level || 'Low'}
                score={latestPrediction?.risk_score}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Factor Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Attendance Rate</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.attendance_rate}%
          </div>
          <span className={`text-[10px] ${latestMetrics?.attendance_rate < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {latestMetrics?.attendance_rate < 75 ? 'Below benchmark (75%)' : 'On track'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Cumulative Average</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.average_score}%
          </div>
          <span className="text-[10px] text-slate-400">All coursework</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Recent Exam</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.recent_exam_score}%
          </div>
          <span className={`text-[10px] ${latestMetrics?.recent_exam_score < 55 ? 'text-rose-400' : 'text-slate-400'}`}>
            Latest midterm
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Assignments Done</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.assignment_completion}%
          </div>
          <span className="text-[10px] text-slate-400">Submissions rate</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">LMS Engagement</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.engagement_score}/100
          </div>
          <span className="text-[10px] text-slate-400">Portal activity index</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Course Backlogs</span>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {latestMetrics?.previous_failures}
          </div>
          <span className={`text-[10px] ${latestMetrics?.previous_failures > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {latestMetrics?.previous_failures > 0 ? 'Requires remediation' : 'No fails'}
          </span>
        </div>
      </div>

      {/* Confidence & Explainability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Explainable Contributing Factors */}
        <div className="lg:col-span-7 space-y-6">
          <FactorsList
            factors={latestPrediction?.contributing_factors || []}
            title="Why this prediction? — Factors Associated with Model Score"
          />

          <ConfidenceIndicator
            confidence={latestPrediction?.confidence_score || 0.85}
            modelVersion={latestPrediction?.model_version}
            timestamp={latestPrediction?.created_at}
          />
        </div>

        {/* Right: Embedded Interactive What-If Simulator */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  What-If Risk Simulator
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Novelty Feature
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Adjust controllable indicators below to simulate how intervention outcomes would impact the model estimate.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Attendance Rate</span>
                  <span className="font-mono font-bold text-cyan-400">{simAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cumulative Average</span>
                  <span className="font-mono font-bold text-cyan-400">{simAvgScore}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simAvgScore}
                  onChange={(e) => setSimAvgScore(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Recent Exam Score</span>
                  <span className="font-mono font-bold text-cyan-400">{simRecentExam}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simRecentExam}
                  onChange={(e) => setSimRecentExam(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Assignment Completion</span>
                  <span className="font-mono font-bold text-cyan-400">{simAssignments}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simAssignments}
                  onChange={(e) => setSimAssignments(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LMS Engagement</span>
                  <span className="font-mono font-bold text-cyan-400">{simEngagement}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simEngagement}
                  onChange={(e) => setSimEngagement(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleRunWhatIf}
              disabled={isSimulating}
              className="w-full mt-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              {isSimulating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Run Scenario Estimate</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-800/60 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Baseline Risk:</span>
                <RiskBadge level={simResult.baseline_risk_level} score={simResult.baseline_risk_score} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-semibold">Simulated Risk:</span>
                <RiskBadge level={simResult.simulated_risk_level} score={simResult.simulated_risk_score} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Net Risk Difference:</span>
                <span className={`font-mono font-bold ${simResult.risk_difference < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simResult.risk_difference > 0 ? '+' : ''}{(simResult.risk_difference * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 leading-tight">
                {simResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interventions & Follow-ups Accordion */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              Active Interventions & Recorded Follow-ups
            </h3>
            <p className="text-xs text-slate-400">
              Support plans assigned to this student with tracked check-ins.
            </p>
          </div>

          <button
            onClick={() => setShowInterventionModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-medium transition-all"
          >
            <Plus size={14} />
            <span>New Action Plan</span>
          </button>
        </div>

        {student.interventions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
            No intervention plans have been logged for this student yet. Click "New Action Plan" to assign support.
          </div>
        ) : (
          <div className="space-y-3">
            {student.interventions.map((it) => (
              <div
                key={it.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{it.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {it.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      it.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {it.priority} Priority
                    </span>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    it.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {it.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{it.action_plan}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Assignee: {it.assignee_name || 'Unassigned'} • Due: {it.due_date}</span>

                  {it.followups && it.followups.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Follow-up:</span>
                      {it.followups.map((f) => (
                        <span
                          key={f.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            f.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-amber-400 border-slate-700'
                          }`}
                        >
                          {f.status} {f.risk_change_observed ? `(${f.risk_change_observed})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Log Intervention Plan for {student.first_name} {student.last_name}
              </h3>
              <button
                onClick={() => setShowInterventionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Support Category *</label>
                  <select
                    value={intervCategory}
                    onChange={(e) => setIntervCategory(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Academic Support">Academic Support / Tutoring</option>
                    <option value="Attendance Support">Attendance Support</option>
                    <option value="Mentoring">Faculty Mentoring</option>
                    <option value="Counselling Referral">Counselling Referral</option>
                    <option value="Financial/Resource Referral">Financial / Resource Referral</option>
                    <option value="Family Communication">Family Communication</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={intervPriority}
                    onChange={(e) => setIntervPriority(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Intervention Title *</label>
                <input
                  required
                  placeholder="e.g. Mandatory peer tutoring in discrete math"
                  value={intervTitle}
                  onChange={(e) => setIntervTitle(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Action Plan & Milestones *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe concrete steps, frequency of meetings, and expectations..."
                  value={intervActionPlan}
                  onChange={(e) => setIntervActionPlan(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Action Due Date</label>
                  <input
                    type="date"
                    value={intervDueDate}
                    onChange={(e) => setIntervDueDate(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Schedule Follow-up Check-in</label>
                  <input
                    type="date"
                    value={intervFollowupDate}
                    onChange={(e) => setIntervFollowupDate(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg"
                >
                  Save Intervention Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
