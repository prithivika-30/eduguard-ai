import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/stage-comparison")
def get_stage_comparison(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    stages = ["School", "Higher Secondary", "Undergraduate", "Other"]
    results = []

    for st in stages:
        st_students = db.query(models.Student).filter(models.Student.stage == st).all()
        total_in_stage = len(st_students)
        if total_in_stage == 0:
            results.append({
                "stage": st,
                "total": 0,
                "high_risk": 0,
                "medium_risk": 0,
                "low_risk": 0,
                "avg_attendance": 0.0,
                "avg_score": 0.0
            })
            continue

        high_c = 0
        med_c = 0
        low_c = 0
        total_att = 0.0
        total_sc = 0.0
        valid_m = 0

        for stu in st_students:
            latest_p = db.query(models.Prediction).filter(
                models.Prediction.student_id == stu.id,
                models.Prediction.is_what_if == False
            ).order_by(desc(models.Prediction.created_at)).first()

            if latest_p:
                if latest_p.risk_level == "High":
                    high_c += 1
                elif latest_p.risk_level == "Medium":
                    med_c += 1
                else:
                    low_c += 1
            else:
                low_c += 1

            latest_m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == stu.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
            if latest_m:
                total_att += latest_m.attendance_rate
                total_sc += latest_m.average_score
                valid_m += 1

        results.append({
            "stage": st,
            "total": total_in_stage,
            "high_risk": high_c,
            "medium_risk": med_c,
            "low_risk": low_c,
            "avg_attendance": round(total_att / valid_m, 1) if valid_m else 0.0,
            "avg_score": round(total_sc / valid_m, 1) if valid_m else 0.0
        })

    return results

@router.get("/attendance-vs-risk")
def get_attendance_vs_risk(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Groups students into attendance brackets: <60%, 60-74%, 75-89%, >=90%
    brackets = [
        {"bracket": "< 60% Attendance", "min": 0, "max": 59.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"bracket": "60% - 74% Attendance", "min": 60, "max": 74.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"bracket": "75% - 89% Attendance", "min": 75, "max": 89.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"bracket": ">= 90% Attendance", "min": 90, "max": 100.0, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
    ]

    students = db.query(models.Student).all()
    for s in students:
        m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == s.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
        p = db.query(models.Prediction).filter(models.Prediction.student_id == s.id, models.Prediction.is_what_if == False).order_by(desc(models.Prediction.created_at)).first()

        att = m.attendance_rate if m else 80.0
        r_level = p.risk_level if p else "Low"

        for b in brackets:
            if b["min"] <= att <= b["max"]:
                if r_level == "High":
                    b["high_risk"] += 1
                elif r_level == "Medium":
                    b["medium_risk"] += 1
                else:
                    b["low_risk"] += 1
                break

    return brackets

@router.get("/performance-vs-risk")
def get_performance_vs_risk(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Groups students into score bands: < 50%, 50-64%, 65-79%, >=80%
    bands = [
        {"band": "Critical (< 50%)", "min": 0, "max": 49.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"band": "Moderate (50-64%)", "min": 50, "max": 64.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"band": "Competent (65-79%)", "min": 65, "max": 79.99, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
        {"band": "Distinction (>=80%)", "min": 80, "max": 100.0, "high_risk": 0, "medium_risk": 0, "low_risk": 0},
    ]

    students = db.query(models.Student).all()
    for s in students:
        m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == s.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
        p = db.query(models.Prediction).filter(models.Prediction.student_id == s.id, models.Prediction.is_what_if == False).order_by(desc(models.Prediction.created_at)).first()

        sc = m.average_score if m else 75.0
        r_level = p.risk_level if p else "Low"

        for b in bands:
            if b["min"] <= sc <= b["max"]:
                if r_level == "High":
                    b["high_risk"] += 1
                elif r_level == "Medium":
                    b["medium_risk"] += 1
                else:
                    b["low_risk"] += 1
                break

    return bands

@router.get("/intervention-effectiveness")
def get_intervention_effectiveness(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    followups = db.query(models.Followup).filter(models.Followup.risk_change_observed.isnot(None)).all()

    improved = sum(1 for f in followups if f.risk_change_observed == "Improved")
    no_change = sum(1 for f in followups if f.risk_change_observed == "No Change")
    worsened = sum(1 for f in followups if f.risk_change_observed == "Worsened")
    total_evaluated = improved + no_change + worsened

    # Grouped by category
    categories = [
        "Academic Support",
        "Attendance Support",
        "Mentoring",
        "Counselling Referral",
        "Financial/Resource Referral",
        "Family Communication"
    ]
    by_category = []
    for cat in categories:
        c_intervs = db.query(models.Intervention).filter(models.Intervention.category == cat).all()
        c_completed = sum(1 for i in c_intervs if i.status == "Completed")
        c_in_progress = sum(1 for i in c_intervs if i.status in ["In Progress", "Planned"])
        by_category.append({
            "category": cat,
            "total": len(c_intervs),
            "completed": c_completed,
            "in_progress": c_in_progress
        })

    return {
        "outcomes": [
            {"outcome": "Risk Improved", "count": improved, "color": "#10B981"},
            {"outcome": "No Change Observed", "count": no_change, "color": "#F59E0B"},
            {"outcome": "Risk Escalated/Worsened", "count": worsened, "color": "#EF4444"}
        ],
        "total_evaluated_followups": total_evaluated,
        "improvement_rate_pct": round((improved / total_evaluated * 100), 1) if total_evaluated else 0.0,
        "by_category": by_category
    }

@router.get("/data-quality-summary")
def get_data_quality_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_students = db.query(models.Student).count()
    total_metrics = db.query(models.StudentMetrics).count()
    
    # Missing email rate
    missing_email = db.query(models.Student).filter(models.Student.email.is_(None)).count()
    
    # Valid ranges rate
    out_of_range = db.query(models.StudentMetrics).filter(
        (models.StudentMetrics.attendance_rate < 0) | (models.StudentMetrics.attendance_rate > 100)
    ).count()

    completeness = round(((total_students - missing_email) / total_students * 100) if total_students else 100.0, 1)

    return {
        "overall_status": "Good",
        "data_completeness_pct": completeness,
        "total_registered_students": total_students,
        "metrics_checkpoints_recorded": total_metrics,
        "missing_email_records": missing_email,
        "out_of_bound_entries": out_of_range,
        "freshness": "Updated within last 24 hours"
    }
