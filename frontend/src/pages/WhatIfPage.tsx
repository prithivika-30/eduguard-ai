import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { Student, WhatIfResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { FactorsList } from '../components/common/FactorsList';

export const WhatIfPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Controllable indicators
  const [attendance, setAttendance] = useState<number>(62);
  const [averageScore, setAverageScore] = useState<number>(55);
  const [recentExam, setRecentExam] = useState<number>(50);
  const [assignments, setAssignments] = useState<number>(60);
  const [engagement, setEngagement] = useState<number>(45);
  const [backlogs, setBacklogs] = useState<number>(1);

  const [simulation, setSimulation] = useState<WhatIfResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const data = await api.getStudents({ limit: 50 });
        setStudents(data);
        if (data.length > 0) {
          const firstHigh = data.find((s) => s.latest_prediction?.risk_level === 'High') || data[0];
          setSelectedStudentId(firstHigh.id);
          setSelectedStudent(firstHigh);

          const m = firstHigh.latest_metrics;
          if (m) {
            setAttendance(m.attendance_rate);
            setAverageScore(m.average_score);
            setRecentExam(m.recent_exam_score);
            setAssignments(m.assignment_completion);
            setEngagement(m.engagement_score);
            setBacklogs(m.previous_failures);
          }
        }
      } catch (err) {
        console.error('Failed to load students for what-if', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, []);

  const handleStudentChange = (id: number) => {
    setSelectedStudentId(id);
    const stu = students.find((s) => s.id === id);
    if (stu) {
      setSelectedStudent(stu);
      const m = stu.latest_metrics;
      if (m) {
        setAttendance(m.attendance_rate);
        setAverageScore(m.average_score);
        setRecentExam(m.recent_exam_score);
        setAssignments(m.assignment_completion);
        setEngagement(m.engagement_score);
        setBacklogs(m.previous_failures);
      }
      setSimulation(null);
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedStudentId) return;
    setIsSimulating(true);
    try {
      const res = await api.runWhatIf({
        student_id: selectedStudentId,
        attendance_rate: attendance,
        average_score: averageScore,
        recent_exam_score: recentExam,
        assignment_completion: assignments,
        engagement_score: engagement,
        previous_failures: backlogs,
      });
      setSimulation(res);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <SlidersHorizontal size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              What-If Scenario Risk Simulator
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
              Core Novelty
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Model how proposed academic and behavioral target shifts impact dropout risk probability in real time.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium shrink-0">Select Target Student:</label>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => handleStudentChange(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-xs"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.student_id} — {s.first_name} {s.last_name} ({s.latest_prediction?.risk_level || 'Low'} Risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Novelty Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2.5">
        <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Methodological Transparency: </strong>
          Scenario estimate — not a guarantee of outcome. The model computes conditional probabilities
          based on active ensemble algorithms. Adjustments show predictive model sensitivity and do not claim causal certainty.
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controllable Indicators Slider Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-slate-100 text-sm">
              Adjust Controllable Indicators
            </h3>
            <button
              onClick={() => {
                if (selectedStudent?.latest_metrics) {
                  const m = selectedStudent.latest_metrics;
                  setAttendance(m.attendance_rate);
                  setAverageScore(m.average_score);
                  setRecentExam(m.recent_exam_score);
                  setAssignments(m.assignment_completion);
                  setEngagement(m.engagement_score);
                  setBacklogs(m.previous_failures);
                }
              }}
              title="Reset to baseline"
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw size={11} /> Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Attendance Rate */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Attendance Rate</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{attendance}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>30% (Critical)</span>
                <span>75% (Threshold)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Average Score */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Cumulative Average Grade</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{averageScore}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={averageScore}
                onChange={(e) => setAverageScore(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>30%</span>
                <span>60% (Passing)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Recent Exam Score */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Recent Midterm Exam Score</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{recentExam}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                step="1"
                value={recentExam}
                onChange={(e) => setRecentExam(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>25%</span>
                <span>55% (Warning)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Assignment Completion */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Assignment Completion Rate</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{assignments}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={assignments}
                onChange={(e) => setAssignments(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>20%</span>
                <span>70%</span>
                <span>100%</span>
              </div>
            </div>

            {/* LMS Engagement */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">LMS Engagement Index</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{engagement}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={engagement}
                onChange={(e) => setEngagement(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>10 (Low Activity)</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Backlogs */}
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1.5">
                <span className="font-medium">Course Backlogs / Failures</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{backlogs}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={backlogs}
                onChange={(e) => setBacklogs(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 (Clean Record)</span>
                <span>1</span>
                <span>5 (High Risk)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 disabled:opacity-50"
          >
            {isSimulating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={15} />
                <span>Calculate What-If Scenario</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Comparative Results & Factor Evolution */}
        <div className="lg:col-span-7 space-y-6">
          {simulation ? (
            <div className="space-y-6 animate-fade-in">
              {/* Comparative Outcome Card */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="font-semibold text-slate-100 text-sm">
                  Scenario Comparative Analysis
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  {/* Current Baseline */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Current Baseline</span>
                    <div className="my-2">
                      <RiskBadge
                        level={simulation.baseline_risk_level}
                        score={simulation.baseline_risk_score}
                        size="md"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-200">
                      {(simulation.baseline_risk_score * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Modified Scenario */}
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60">
                    <span className="text-[11px] text-cyan-300 font-medium">Simulated Outcome</span>
                    <div className="my-2">
                      <RiskBadge
                        level={simulation.simulated_risk_level}
                        score={simulation.simulated_risk_score}
                        size="md"
                      />
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-300">
                      {(simulation.simulated_risk_score * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Difference */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Net Risk Shift</span>
                    <div className="flex items-center justify-center gap-1.5 my-2">
                      {simulation.risk_difference < 0 ? (
                        <TrendingDown size={22} className="text-emerald-400" />
                      ) : (
                        <TrendingUp size={22} className="text-rose-400" />
                      )}
                      <span
                        className={`text-2xl font-extrabold font-mono ${
                          simulation.risk_difference < 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {simulation.risk_difference > 0 ? '+' : ''}
                        {(simulation.risk_difference * 100).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {simulation.risk_difference < 0 ? 'Risk alleviated' : 'Risk exacerbated'}
                    </span>
                  </div>
                </div>

                {/* Metric by Metric Diff Breakdown */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2.5">
                    Indicator Differences Summary
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {simulation.comparison.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex justify-between items-center"
                      >
                        <span className="text-slate-400 truncate pr-1">{item.metric}</span>
                        <div className="font-mono text-right shrink-0">
                          <span className="text-slate-200">{item.simulated}</span>
                          <span
                            className={`ml-1 text-[11px] ${
                              item.diff > 0
                                ? 'text-emerald-400'
                                : item.diff < 0
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            ({item.diff > 0 ? '+' : ''}
                            {item.diff})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Changed Contributing Factors */}
              <FactorsList
                factors={simulation.changed_factors}
                title="Scenario Contributing Factors & Association Direction"
              />
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <SlidersHorizontal size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                Ready to Simulate Scenario
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Adjust any of the sliders on the left panel (such as increasing attendance from 62% to 80%)
                and click <strong>Calculate What-If Scenario</strong> to see model sensitivity.
              </p>
              <button
                onClick={handleRunSimulation}
                className="mt-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-lg"
              >
                Run Quick Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
