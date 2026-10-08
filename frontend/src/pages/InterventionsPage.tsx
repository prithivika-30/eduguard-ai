import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { Intervention, Student } from '../types';

interface InterventionsPageProps {
  onNavigate: (path: string) => void;
}

export const InterventionsPage: React.FC<InterventionsPageProps> = ({ onNavigate }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInterventions({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
      });
      setInterventions(data);
    } catch (err) {
      console.error('Failed to load interventions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateIntervention(id, { status: newStatus });
      fetchInterventions();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Support Interventions Registry
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Assigned student actions: academic tutoring, attendance support, counselling, and resource assistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getInterventionsCsvUrl()}
            download
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic Support">Academic Support</option>
            <option value="Attendance Support">Attendance Support</option>
            <option value="Mentoring">Mentoring</option>
            <option value="Counselling Referral">Counselling Referral</option>
            <option value="Financial/Resource Referral">Financial / Resource</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Interventions List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading interventions...
          </div>
        ) : interventions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No intervention plans found matching the selected filters.
          </div>
        ) : (
          interventions.map((it) => (
            <div
              key={it.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white text-sm">{it.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {it.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      it.priority === 'High'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {it.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={it.status}
                    onChange={(e) => handleStatusChange(it.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                {it.action_plan}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <span>Student: <strong className="text-slate-200">{it.student_name}</strong> ({it.student_code})</span>
                  <span>•</span>
                  <span>Assignee: <strong className="text-slate-200">{it.assignee_name}</strong></span>
                  <span>•</span>
                  <span>Due: {it.due_date}</span>
                </div>

                <button
                  onClick={() => onNavigate(`/students/${it.student_id}`)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <span>Student Profile</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
