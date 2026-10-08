import {
  User,
  Student,
  StudentDetail,
  DashboardSummary,
  WhatIfResponse,
  Intervention,
  Followup,
  ModelVersion,
  DatasetValidationResult,
  AuditLog,
  InstitutionSettings
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('eduguard_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('eduguard_token');
    localStorage.removeItem('eduguard_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('eduguard_token', res.access_token);
    localStorage.setItem('eduguard_user', JSON.stringify(res.user));
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.removeItem('eduguard_token');
    localStorage.removeItem('eduguard_user');
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/dashboard/summary');
  },

  async getDashboardTrends(): Promise<{ period: string; high_risk: number; medium_risk: number; low_risk: number }[]> {
    return request('/dashboard/trends');
  },

  // Students
  async getStudents(params: Record<string, string | number> = {}): Promise<Student[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<Student[]>(`/students${query ? `?${query}` : ''}`);
  },

  async getStudent(id: number): Promise<StudentDetail> {
    return request<StudentDetail>(`/students/${id}`);
  },

  async createStudent(data: any): Promise<Student> {
    return request<Student>('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateStudent(id: number, data: any): Promise<{ message: string }> {
    return request<{ message: string }>(`/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async recordStudentMetrics(id: number, data: any): Promise<any> {
    return request(`/students/${id}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Predictions & What-If
  async runPrediction(data: any): Promise<any> {
    return request('/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async runWhatIf(data: any): Promise<WhatIfResponse> {
    return request<WhatIfResponse>('/what-if', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Interventions
  async getInterventions(params: Record<string, string | number> = {}): Promise<Intervention[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<Intervention[]>(`/interventions${query ? `?${query}` : ''}`);
  },

  async createIntervention(data: any): Promise<Intervention> {
    return request<Intervention>('/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateIntervention(id: number, data: any): Promise<Intervention> {
    return request<Intervention>(`/interventions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Follow-ups
  async getFollowups(params: Record<string, string | number> = {}): Promise<Followup[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<Followup[]>(`/followups${query ? `?${query}` : ''}`);
  },

  async updateFollowup(id: number, data: any): Promise<Followup> {
    return request<Followup>(`/followups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Datasets
  async validateDataset(file: File): Promise<DatasetValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    return request<DatasetValidationResult>('/datasets/validate', {
      method: 'POST',
      body: formData,
    });
  },

  async importDataset(file: File): Promise<{ message: string; imported_count: number; updated_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/datasets/import', {
      method: 'POST',
      body: formData,
    });
  },

  async getDatasetHistory(): Promise<any[]> {
    return request('/datasets/history');
  },

  // Models
  async getModels(): Promise<ModelVersion[]> {
    return request<ModelVersion[]>('/models');
  },

  async trainModels(): Promise<{ message: string; active_model: string }> {
    return request('/models/train', { method: 'POST' });
  },

  async activateModel(id: number): Promise<{ message: string }> {
    return request(`/models/activate/${id}`, { method: 'POST' });
  },

  // Analytics
  async getStageComparison(): Promise<any[]> {
    return request('/analytics/stage-comparison');
  },

  async getAttendanceVsRisk(): Promise<any[]> {
    return request('/analytics/attendance-vs-risk');
  },

  async getPerformanceVsRisk(): Promise<any[]> {
    return request('/analytics/performance-vs-risk');
  },

  async getInterventionEffectiveness(): Promise<any> {
    return request('/analytics/intervention-effectiveness');
  },

  async getDataQualitySummary(): Promise<any> {
    return request('/analytics/data-quality-summary');
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/audit-logs');
  },

  // Settings
  async getSettings(): Promise<InstitutionSettings> {
    return request<InstitutionSettings>('/settings');
  },

  async updateSettings(data: any): Promise<InstitutionSettings> {
    return request<InstitutionSettings>('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Reports
  getStudentsCsvUrl(): string {
    return `${API_BASE}/reports/students-csv`;
  },

  getInterventionsCsvUrl(): string {
    return `${API_BASE}/reports/interventions-csv`;
  }
};
