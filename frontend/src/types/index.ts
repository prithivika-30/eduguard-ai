export type UserRole = 'admin' | 'educator' | 'counsellor' | 'viewer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentMetrics {
  id?: number;
  student_id?: number;
  attendance_rate: number;
  average_score: number;
  recent_exam_score: number;
  assignment_completion: number;
  engagement_score: number;
  previous_failures: number;
  recorded_at?: string;
  notes?: string;
}

export interface PredictionFactor {
  factor: string;
  impact: 'High Negative' | 'Moderate Negative' | 'Positive' | 'Neutral';
  weight: number;
  value: string | number;
  description: string;
}

export interface Prediction {
  id: number;
  student_id: number;
  risk_level: 'High' | 'Medium' | 'Low';
  risk_score: number;
  confidence_score: number;
  model_version: string;
  is_what_if: boolean;
  contributing_factors: PredictionFactor[];
  created_at: string;
}

export interface Followup {
  id: number;
  intervention_id: number;
  student_id: number;
  scheduled_date: string;
  status: 'Due Today' | 'Overdue' | 'Upcoming' | 'Completed';
  outcome_notes?: string;
  risk_change_observed?: 'Improved' | 'No Change' | 'Worsened';
  completed_at?: string;
  created_at: string;
  intervention_title?: string;
  student_name?: string;
  student_code?: string;
}

export interface Intervention {
  id: number;
  student_id: number;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  action_plan: string;
  assigned_to_id?: number;
  due_date: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_code?: string;
  assignee_name?: string;
  followups?: Followup[];
}

export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  stage: 'School' | 'Higher Secondary' | 'Undergraduate' | 'Other';
  department: string;
  semester: number;
  enrollment_year: number;
  status: 'Active' | 'On Leave' | 'Graduated' | 'Withdrawn';
  created_at: string;
  updated_at: string;
  latest_metrics?: StudentMetrics;
  latest_prediction?: Prediction;
  active_interventions_count?: number;
  pending_followups_count?: number;
}

export interface StudentDetail extends Student {
  metrics_history: StudentMetrics[];
  predictions_history: Prediction[];
  interventions: Intervention[];
  followups: Followup[];
}

export interface DashboardSummary {
  total_students: number;
  attention_required: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  active_interventions_count: number;
  followups_due_today: number;
  followups_overdue: number;
  average_attendance: number;
  average_score: number;
  risk_distribution: {
    risk_level: string;
    count: number;
    percentage: number;
  }[];
}

export interface WhatIfComparisonItem {
  metric: string;
  baseline: number;
  simulated: number;
  diff: number;
}

export interface WhatIfResponse {
  baseline_risk_level: 'High' | 'Medium' | 'Low';
  baseline_risk_score: number;
  simulated_risk_level: 'High' | 'Medium' | 'Low';
  simulated_risk_score: number;
  risk_difference: number;
  changed_factors: PredictionFactor[];
  comparison: WhatIfComparisonItem[];
  model_version: string;
  disclaimer: string;
}

export interface ModelVersion {
  id: number;
  model_name: string;
  version_tag: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  is_active: boolean;
  feature_importances: Record<string, number>;
  dataset_records_count: number;
  trained_at: string;
}

export interface DatasetQualityMetric {
  metric: string;
  value: any;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

export interface DatasetValidationResult {
  is_valid: boolean;
  filename: string;
  total_rows: number;
  quality_score: number;
  missing_rate: number;
  duplicate_count: number;
  invalid_ranges_count: number;
  column_mapping: Record<string, string>;
  checks: DatasetQualityMetric[];
  sample_preview: Record<string, any>[];
  validation_status: 'Good' | 'Needs Review' | 'Poor';
}

export interface DatasetOut {
  id: number;
  filename: string;
  row_count: number;
  data_quality_score: number;
  missing_rate: number;
  duplicate_count: number;
  invalid_ranges_count: number;
  status: string;
  imported_at: string;
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  timestamp: string;
}

export interface InstitutionSettings {
  id: number;
  institution_name: string;
  high_risk_threshold: number;
  medium_risk_threshold: number;
  academic_term: string;
  notification_channels: string;
  data_retention_days: number;
  updated_at: string;
}
