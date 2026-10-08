from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str
    department: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Student & Metrics Schemas
class StudentMetricsBase(BaseModel):
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage")
    average_score: float = Field(..., ge=0.0, le=100.0, description="Cumulative grade average")
    recent_exam_score: float = Field(..., ge=0.0, le=100.0, description="Latest exam score percentage")
    assignment_completion: float = Field(..., ge=0.0, le=100.0, description="Assignment submission percentage")
    engagement_score: float = Field(..., ge=0.0, le=100.0, description="LMS and portal participation index")
    previous_failures: int = Field(0, ge=0, description="Number of backlogs or course failures")
    notes: Optional[str] = None

class StudentMetricsCreate(StudentMetricsBase):
    pass

class StudentMetricsOut(StudentMetricsBase):
    id: int
    student_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    stage: str = "Undergraduate"
    department: str
    semester: int = 1
    enrollment_year: int = 2024
    status: str = "Active"

class StudentCreate(StudentBase):
    metrics: Optional[StudentMetricsCreate] = None

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    stage: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    enrollment_year: Optional[int] = None
    status: Optional[str] = None

class PredictionFactor(BaseModel):
    factor: str
    impact: str # "High Negative", "Moderate Negative", "Positive", "Neutral"
    weight: float # e.g. -0.35, +0.20
    value: Any
    description: str

class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    student_id: int
    risk_level: str # Low, Medium, High
    risk_score: float # 0.0 - 1.0
    confidence_score: float # 0.0 - 1.0
    model_version: str
    is_what_if: bool
    contributing_factors: List[PredictionFactor]
    created_at: datetime

class StudentOut(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    latest_metrics: Optional[StudentMetricsOut] = None
    latest_prediction: Optional[PredictionOut] = None
    active_interventions_count: int = 0
    pending_followups_count: int = 0

    class Config:
        from_attributes = True

# What-If Schemas
class WhatIfRequest(BaseModel):
    student_id: int
    attendance_rate: float = Field(..., ge=0.0, le=100.0)
    average_score: float = Field(..., ge=0.0, le=100.0)
    recent_exam_score: float = Field(..., ge=0.0, le=100.0)
    assignment_completion: float = Field(..., ge=0.0, le=100.0)
    engagement_score: float = Field(..., ge=0.0, le=100.0)
    previous_failures: int = Field(0, ge=0)

class WhatIfComparisonItem(BaseModel):
    metric: str
    baseline: float
    simulated: float
    diff: float

class WhatIfResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    baseline_risk_level: str
    baseline_risk_score: float
    simulated_risk_level: str
    simulated_risk_score: float
    risk_difference: float
    changed_factors: List[PredictionFactor]
    comparison: List[WhatIfComparisonItem]
    model_version: str
    disclaimer: str = "Scenario estimate — not a guarantee of outcome. EduGuard AI provides decision-support signals and does not establish causality."

# Intervention Schemas
class InterventionBase(BaseModel):
    category: str # Academic Support, Attendance Support, Mentoring, Counselling Referral, Financial/Resource Referral, Family Communication, Other
    priority: str = "Medium" # High, Medium, Low
    title: str
    action_plan: str
    assigned_to_id: Optional[int] = None
    due_date: date
    status: str = "Planned" # Planned, In Progress, Completed, Cancelled
    notes: Optional[str] = None

class InterventionCreate(InterventionBase):
    student_id: int
    followup_date: Optional[date] = None

class InterventionUpdate(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    title: Optional[str] = None
    action_plan: Optional[str] = None
    assigned_to_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class FollowupBase(BaseModel):
    scheduled_date: date
    status: str = "Upcoming"
    outcome_notes: Optional[str] = None
    risk_change_observed: Optional[str] = None

class FollowupCreate(FollowupBase):
    intervention_id: int
    student_id: int

class FollowupUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    status: Optional[str] = None # Due Today, Overdue, Upcoming, Completed
    outcome_notes: Optional[str] = None
    risk_change_observed: Optional[str] = None # Improved, No Change, Worsened

class FollowupOut(FollowupBase):
    id: int
    intervention_id: int
    student_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    intervention_title: Optional[str] = None
    student_name: Optional[str] = None
    student_code: Optional[str] = None

    class Config:
        from_attributes = True

class InterventionOut(InterventionBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    assignee_name: Optional[str] = None
    followups: List[FollowupOut] = []

    class Config:
        from_attributes = True

# Student Detail Out
class StudentDetailOut(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    metrics_history: List[StudentMetricsOut] = []
    predictions_history: List[PredictionOut] = []
    interventions: List[InterventionOut] = []
    followups: List[FollowupOut] = []

# Dataset & Quality Schemas
class DatasetQualityMetric(BaseModel):
    metric: str
    value: Any
    status: str # "pass", "warning", "fail"
    detail: str

class DatasetValidationResult(BaseModel):
    is_valid: bool
    filename: str
    total_rows: int
    quality_score: float # 0 - 100
    missing_rate: float
    duplicate_count: int
    invalid_ranges_count: int
    column_mapping: Dict[str, str]
    checks: List[DatasetQualityMetric]
    sample_preview: List[Dict[str, Any]]
    validation_status: str # "Good", "Needs Review", "Poor"

class DatasetOut(BaseModel):
    id: int
    filename: str
    row_count: int
    data_quality_score: float
    missing_rate: float
    duplicate_count: int
    invalid_ranges_count: int
    status: str
    imported_at: datetime

    class Config:
        from_attributes = True

# Model Schemas
class ModelVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    model_name: str
    version_tag: str
    algorithm: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    is_active: bool
    feature_importances: Dict[str, float]
    dataset_records_count: int
    trained_at: datetime

class ModelTrainRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_type: str = "Random Forest"

# Dashboard & Analytics
class RiskDistributionItem(BaseModel):
    risk_level: str
    count: int
    percentage: float

class DashboardSummaryOut(BaseModel):
    total_students: int
    attention_required: int # High + Medium risk
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    active_interventions_count: int
    followups_due_today: int
    followups_overdue: int
    average_attendance: float
    average_score: float
    risk_distribution: List[RiskDistributionItem]

class DashboardTrendItem(BaseModel):
    period: str
    high_risk: int
    medium_risk: int
    low_risk: int

# Audit Log
class AuditLogOut(BaseModel):
    id: int
    user_email: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# Settings
class InstitutionSettingsOut(BaseModel):
    id: int
    institution_name: str
    high_risk_threshold: float
    medium_risk_threshold: float
    academic_term: str
    notification_channels: str
    data_retention_days: int
    updated_at: datetime

    class Config:
        from_attributes = True

class InstitutionSettingsUpdate(BaseModel):
    institution_name: Optional[str] = None
    high_risk_threshold: Optional[float] = None
    medium_risk_threshold: Optional[float] = None
    academic_term: Optional[str] = None
    notification_channels: Optional[str] = None
    data_retention_days: Optional[int] = None
