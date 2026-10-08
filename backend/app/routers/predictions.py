import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from app.database import get_db
from app import models, schemas, auth, ml_engine

router = APIRouter(prefix="/predictions", tags=["Predictions"])

class DirectPredictionRequest(BaseModel):
    student_id: Optional[int] = None
    attendance_rate: float
    average_score: float
    recent_exam_score: float
    assignment_completion: float
    engagement_score: float
    previous_failures: int = 0
    save_to_database: bool = False

@router.post("", response_model=schemas.PredictionOut)
def run_prediction(
    req: DirectPredictionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    settings = db.query(models.InstitutionSettings).first()
    high_th = settings.high_risk_threshold if settings else 0.70
    med_th = settings.medium_risk_threshold if settings else 0.40

    feats = {
        "attendance_rate": req.attendance_rate,
        "average_score": req.average_score,
        "recent_exam_score": req.recent_exam_score,
        "assignment_completion": req.assignment_completion,
        "engagement_score": req.engagement_score,
        "previous_failures": req.previous_failures
    }

    pred_res = ml_engine.predict_student_risk(feats, high_th, med_th)

    pred_id = 0
    created_at = None

    if req.save_to_database and req.student_id:
        stu = db.query(models.Student).filter(models.Student.id == req.student_id).first()
        if not stu:
            raise HTTPException(status_code=404, detail="Student not found to attach prediction")

        pred_obj = models.Prediction(
            student_id=req.student_id,
            risk_level=pred_res["risk_level"],
            risk_score=pred_res["risk_score"],
            confidence_score=pred_res["confidence_score"],
            model_version=pred_res["model_version"],
            is_what_if=False,
            contributing_factors=json.dumps(pred_res["contributing_factors"]),
            created_by_user_id=current_user.id
        )
        db.add(pred_obj)
        
        # Audit log
        db.add(models.AuditLog(
            user_id=current_user.id,
            user_email=current_user.email,
            action="PREDICTION_RUN",
            entity_type="Student",
            entity_id=stu.student_id,
            details=f"Generated {pred_res['risk_level']} risk prediction ({pred_res['risk_score']})"
        ))
        db.commit()
        db.refresh(pred_obj)
        pred_id = pred_obj.id
        created_at = pred_obj.created_at
    else:
        import datetime
        created_at = datetime.datetime.utcnow()

    return schemas.PredictionOut(
        id=pred_id,
        student_id=req.student_id or 0,
        risk_level=pred_res["risk_level"],
        risk_score=pred_res["risk_score"],
        confidence_score=pred_res["confidence_score"],
        model_version=pred_res["model_version"],
        is_what_if=False,
        contributing_factors=pred_res["contributing_factors"],
        created_at=created_at
    )

@router.get("/{id}", response_model=schemas.PredictionOut)
def get_prediction(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    pred = db.query(models.Prediction).filter(models.Prediction.id == id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    factors = []
    try:
        factors = json.loads(pred.contributing_factors)
    except Exception:
        factors = []

    return schemas.PredictionOut(
        id=pred.id,
        student_id=pred.student_id,
        risk_level=pred.risk_level,
        risk_score=pred.risk_score,
        confidence_score=pred.confidence_score,
        model_version=pred.model_version,
        is_what_if=pred.is_what_if,
        contributing_factors=factors,
        created_at=pred.created_at
    )
