from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas, auth, ml_engine

router = APIRouter(prefix="/what-if", tags=["What-If Simulator"])

@router.post("", response_model=schemas.WhatIfResponse)
def simulate_what_if_scenario(
    req: schemas.WhatIfRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found for what-if simulation")

    # Get latest actual baseline metrics
    latest_m = db.query(models.StudentMetrics).filter(
        models.StudentMetrics.student_id == req.student_id
    ).order_by(desc(models.StudentMetrics.recorded_at)).first()

    if not latest_m:
        raise HTTPException(status_code=400, detail="Student has no baseline metrics recorded")

    baseline_features = {
        "attendance_rate": latest_m.attendance_rate,
        "average_score": latest_m.average_score,
        "recent_exam_score": latest_m.recent_exam_score,
        "assignment_completion": latest_m.assignment_completion,
        "engagement_score": latest_m.engagement_score,
        "previous_failures": latest_m.previous_failures
    }

    simulated_features = {
        "attendance_rate": req.attendance_rate,
        "average_score": req.average_score,
        "recent_exam_score": req.recent_exam_score,
        "assignment_completion": req.assignment_completion,
        "engagement_score": req.engagement_score,
        "previous_failures": req.previous_failures
    }

    settings = db.query(models.InstitutionSettings).first()
    high_th = settings.high_risk_threshold if settings else 0.70
    med_th = settings.medium_risk_threshold if settings else 0.40

    result = ml_engine.run_what_if_simulation(
        baseline_features=baseline_features,
        simulated_features=simulated_features,
        high_threshold=high_th,
        medium_threshold=med_th
    )

    return schemas.WhatIfResponse(
        baseline_risk_level=result["baseline_risk_level"],
        baseline_risk_score=result["baseline_risk_score"],
        simulated_risk_level=result["simulated_risk_level"],
        simulated_risk_score=result["simulated_risk_score"],
        risk_difference=result["risk_difference"],
        changed_factors=result["changed_factors"],
        comparison=result["comparison"],
        model_version=result["model_version"],
        disclaimer=result["disclaimer"]
    )
