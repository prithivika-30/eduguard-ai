import json
import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd

from app.database import get_db
from app import models, schemas, auth, ml_engine

router = APIRouter(prefix="/models", tags=["Machine Learning Models"])

@router.get("", response_model=List[schemas.ModelVersionOut])
def get_model_versions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    models_list = db.query(models.ModelVersion).order_by(models.ModelVersion.f1_score.desc()).all()
    
    # If empty, train once to initialize
    if not models_list:
        ml_engine.train_and_evaluate_all_models()
        if ml_engine.os.path.exists(ml_engine.META_FILE):
            with open(ml_engine.META_FILE, "r") as f:
                meta = json.load(f)
                for m_name, m_info in meta.get("models", {}).items():
                    m_v = models.ModelVersion(
                        model_name=m_name,
                        version_tag=f"v1.0-{m_name.replace(' ', '')}",
                        algorithm=m_name,
                        accuracy=m_info["accuracy"],
                        precision=m_info["precision"],
                        recall=m_info["recall"],
                        f1_score=m_info["f1_score"],
                        roc_auc=m_info["roc_auc"],
                        is_active=(m_name == meta.get("active_model_name")),
                        feature_importances=json.dumps(m_info["feature_importances"]),
                        dataset_records_count=m_info["trained_records"]
                    )
                    db.add(m_v)
                db.commit()
        models_list = db.query(models.ModelVersion).order_by(models.ModelVersion.f1_score.desc()).all()

    result = []
    for m in models_list:
        try:
            fi = json.loads(m.feature_importances)
        except Exception:
            fi = {}
        result.append(schemas.ModelVersionOut(
            id=m.id,
            model_name=m.model_name,
            version_tag=m.version_tag,
            algorithm=m.algorithm,
            accuracy=m.accuracy,
            precision=m.precision,
            recall=m.recall,
            f1_score=m.f1_score,
            roc_auc=m.roc_auc,
            is_active=m.is_active,
            feature_importances=fi,
            dataset_records_count=m.dataset_records_count,
            trained_at=m.trained_at
        ))
    return result

@router.post("/train")
def train_candidate_models(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin"]))
):
    # Retrieve current student records to augment training dataset
    students = db.query(models.Student).all()
    extra_rows = []
    for s in students:
        m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == s.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
        p = db.query(models.Prediction).filter(models.Prediction.student_id == s.id).order_by(desc(models.Prediction.created_at)).first()
        if m:
            label = 1 if (p and p.risk_level == "High") else 0
            extra_rows.append({
                "stage": s.stage,
                "attendance_rate": m.attendance_rate,
                "average_score": m.average_score,
                "recent_exam_score": m.recent_exam_score,
                "assignment_completion": m.assignment_completion,
                "engagement_score": m.engagement_score,
                "previous_failures": m.previous_failures,
                "dropout_label": label
            })

    base_df = ml_engine.generate_synthetic_training_dataset(1200)
    if extra_rows:
        combined_df = pd.concat([base_df, pd.DataFrame(extra_rows)], ignore_index=True)
    else:
        combined_df = base_df

    training_meta = ml_engine.train_and_evaluate_all_models(combined_df)

    # Clear old model version entries and insert refreshed evaluation metrics
    db.query(models.ModelVersion).delete()
    for m_name, m_info in training_meta.get("models", {}).items():
        m_v = models.ModelVersion(
            model_name=m_name,
            version_tag=f"v{datetime.datetime.utcnow().strftime('%y%m%d')}-{m_name.replace(' ', '')}",
            algorithm=m_name,
            accuracy=m_info["accuracy"],
            precision=m_info["precision"],
            recall=m_info["recall"],
            f1_score=m_info["f1_score"],
            roc_auc=m_info["roc_auc"],
            is_active=(m_name == training_meta.get("active_model_name")),
            feature_importances=json.dumps(m_info["feature_importances"]),
            dataset_records_count=m_info["trained_records"]
        )
        db.add(m_v)

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="MODEL_TRAIN",
        entity_type="Model",
        entity_id=training_meta.get("active_model_name"),
        details=f"Retrained 4 candidate models on {len(combined_df)} records. Active: {training_meta.get('active_model_name')}"
    ))
    db.commit()

    return {
        "message": f"Successfully retrained candidate models on {len(combined_df)} records.",
        "active_model": training_meta.get("active_model_name"),
        "models": training_meta.get("models")
    }

@router.post("/activate/{model_id}")
def activate_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin"]))
):
    target = db.query(models.ModelVersion).filter(models.ModelVersion.id == model_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Model version not found")

    # Set all others inactive
    db.query(models.ModelVersion).update({models.ModelVersion.is_active: False})
    target.is_active = True
    db.commit()

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="MODEL_ACTIVATE",
        entity_type="Model",
        entity_id=target.model_name,
        details=f"Activated model {target.model_name} ({target.version_tag})"
    ))
    db.commit()

    return {"message": f"Model {target.model_name} is now the active production model."}
