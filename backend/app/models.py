import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # admin, educator, counsellor, viewer
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    interventions_assigned = relationship("Intervention", foreign_keys="Intervention.assigned_to_id", back_populates="assignee")
    audit_logs = relationship("AuditLog", back_populates="user")


class InstitutionSettings(Base):
    __tablename__ = "institution_settings"

    id = Column(Integer, primary_key=True, index=True)
    institution_name = Column(String(255), default="Apex National University")
    high_risk_threshold = Column(Float, default=0.70)
    medium_risk_threshold = Column(Float, default=0.40)
    academic_term = Column(String(100), default="Fall Term 2026")
    notification_channels = Column(String(255), default="email,in-app")
    data_retention_days = Column(Integer, default=365)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    stage = Column(String(50), nullable=False, default="Undergraduate") # School, Higher Secondary, Undergraduate, Other
    department = Column(String(100), nullable=False)
    semester = Column(Integer, default=1)
    enrollment_year = Column(Integer, default=2024)
    status = Column(String(50), default="Active") # Active, On Leave, Graduated, Withdrawn
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    metrics = relationship("StudentMetrics", back_populates="student", cascade="all, delete-orphan", order_by="desc(StudentMetrics.recorded_at)")
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="student", cascade="all, delete-orphan")


class StudentMetrics(Base):
    __tablename__ = "student_metrics"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    attendance_rate = Column(Float, nullable=False)  # 0.0 - 100.0%
    average_score = Column(Float, nullable=False)    # 0.0 - 100.0%
    recent_exam_score = Column(Float, nullable=False)# 0.0 - 100.0%
    assignment_completion = Column(Float, nullable=False) # 0.0 - 100.0%
    engagement_score = Column(Float, nullable=False) # 0.0 - 100.0% LMS / Portal activity
    previous_failures = Column(Integer, default=0)   # Number of failed courses / backlogs
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    student = relationship("Student", back_populates="metrics")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False) # High, Medium, Low
    risk_score = Column(Float, nullable=False)      # Probability 0.0 - 1.0
    confidence_score = Column(Float, default=0.85)  # Data confidence estimate 0.0 - 1.0
    model_version = Column(String(100), default="v1.0.0-GradientBoosting")
    is_what_if = Column(Boolean, default=False)
    contributing_factors = Column(Text, nullable=False) # JSON array of {factor, impact, value, direction, description}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    student = relationship("Student", back_populates="predictions")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False) # Academic Support, Attendance Support, Mentoring, Counselling Referral, Financial/Resource Referral, Family Communication, Other
    priority = Column(String(20), default="Medium") # High, Medium, Low
    title = Column(String(255), nullable=False)
    action_plan = Column(Text, nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="Planned") # Planned, In Progress, Completed, Cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="interventions")
    assignee = relationship("User", back_populates="interventions_assigned", foreign_keys=[assigned_to_id])
    followups = relationship("Followup", back_populates="intervention", cascade="all, delete-orphan")


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False)
    status = Column(String(50), default="Upcoming") # Due Today, Overdue, Upcoming, Completed
    outcome_notes = Column(Text, nullable=True)
    risk_change_observed = Column(String(50), nullable=True) # Improved, No Change, Worsened
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    intervention = relationship("Intervention", back_populates="followups")
    student = relationship("Student", back_populates="followups")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    data_quality_score = Column(Float, default=100.0) # 0 - 100
    missing_rate = Column(Float, default=0.0)
    duplicate_count = Column(Integer, default=0)
    invalid_ranges_count = Column(Integer, default=0)
    status = Column(String(50), default="Good") # Good, Needs Review, Poor
    validation_details = Column(Text, nullable=True) # JSON
    imported_at = Column(DateTime, default=datetime.datetime.utcnow)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version_tag = Column(String(100), nullable=False, unique=True)
    algorithm = Column(String(100), nullable=False) # GradientBoostingClassifier, RandomForestClassifier, LogisticRegression, DecisionTreeClassifier
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=False)
    is_active = Column(Boolean, default=False)
    feature_importances = Column(Text, nullable=False) # JSON
    dataset_records_count = Column(Integer, default=0)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
    artifact_path = Column(String(255), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
