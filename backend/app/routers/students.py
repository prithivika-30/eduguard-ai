import json
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database import get_db
from app import models, schemas, auth, ml_engine

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[schemas.StudentOut])
def get_students(
    search: Optional[str] = None,
    stage: Optional[str] = None,
    department: Optional[str] = None,
    risk: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Student)

    if search:
        s_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Student.student_id.ilike(s_term),
                models.Student.first_name.ilike(s_term),
                models.Student.last_name.ilike(s_term),
                models.Student.email.ilike(s_term),
                models.Student.department.ilike(s_term),
            )
        )

    if stage and stage != "All":
        query = query.filter(models.Student.stage == stage)

    if department and department != "All":
        query = query.filter(models.Student.department == department)

    if status and status != "All":
        query = query.filter(models.Student.status == status)

    students = query.all()

    # Enrich with latest prediction, metrics, active interventions, pending followups
    result = []
    for s in students:
        latest_m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == s.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
        latest_p = db.query(models.Prediction).filter(
            models.Prediction.student_id == s.id,
            models.Prediction.is_what_if == False
        ).order_by(desc(models.Prediction.created_at)).first()

        # Risk filter
        if risk and risk != "All":
            p_level = latest_p.risk_level if latest_p else "Low"
            if p_level.lower() != risk.lower():
                continue

        active_interv = db.query(models.Intervention).filter(
            models.Intervention.student_id == s.id,
            models.Intervention.status.in_(["Planned", "In Progress"])
        ).count()

        pending_f = db.query(models.Followup).filter(
            models.Followup.student_id == s.id,
            models.Followup.status != "Completed"
        ).count()

        p_out = None
        if latest_p:
            factors = []
            try:
                factors = json.loads(latest_p.contributing_factors)
            except Exception:
                factors = []
            p_out = schemas.PredictionOut(
                id=latest_p.id,
                student_id=latest_p.student_id,
                risk_level=latest_p.risk_level,
                risk_score=latest_p.risk_score,
                confidence_score=latest_p.confidence_score,
                model_version=latest_p.model_version,
                is_what_if=latest_p.is_what_if,
                contributing_factors=factors,
                created_at=latest_p.created_at
            )

        m_out = schemas.StudentMetricsOut.from_orm(latest_m) if latest_m else None

        # Mask email for viewer role
        email_val = s.email
        if current_user.role == "viewer" and email_val:
            parts = email_val.split("@")
            email_val = f"{parts[0][:2]}***@{parts[1]}" if len(parts) == 2 else "***"

        s_dict = schemas.StudentOut(
            id=s.id,
            student_id=s.student_id,
            first_name=s.first_name,
            last_name=s.last_name,
            email=email_val,
            stage=s.stage,
            department=s.department,
            semester=s.semester,
            enrollment_year=s.enrollment_year,
            status=s.status,
            created_at=s.created_at,
            updated_at=s.updated_at,
            latest_metrics=m_out,
            latest_prediction=p_out,
            active_interventions_count=active_interv,
            pending_followups_count=pending_f
        )
        result.append(s_dict)

    # Sorting
    if sort_by == "risk_score":
        result.sort(key=lambda x: (x.latest_prediction.risk_score if x.latest_prediction else 0.0), reverse=(sort_order == "desc"))
    elif sort_by == "attendance":
        result.sort(key=lambda x: (x.latest_metrics.attendance_rate if x.latest_metrics else 0.0), reverse=(sort_order == "desc"))
    elif sort_by == "name":
        result.sort(key=lambda x: f"{x.first_name} {x.last_name}", reverse=(sort_order == "desc"))

    return result[skip : skip + limit]

@router.post("", response_model=schemas.StudentOut)
def create_student(
    student_in: schemas.StudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator"]))
):
    existing = db.query(models.Student).filter(models.Student.student_id == student_in.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student ID {student_in.student_id} already exists")

    new_stu = models.Student(
        student_id=student_in.student_id,
        first_name=student_in.first_name,
        last_name=student_in.last_name,
        email=student_in.email,
        stage=student_in.stage,
        department=student_in.department,
        semester=student_in.semester,
        enrollment_year=student_in.enrollment_year,
        status=student_in.status
    )
    db.add(new_stu)
    db.commit()
    db.refresh(new_stu)

    m_out = None
    p_out = None

    if student_in.metrics:
        met = models.StudentMetrics(
            student_id=new_stu.id,
            attendance_rate=student_in.metrics.attendance_rate,
            average_score=student_in.metrics.average_score,
            recent_exam_score=student_in.metrics.recent_exam_score,
            assignment_completion=student_in.metrics.assignment_completion,
            engagement_score=student_in.metrics.engagement_score,
            previous_failures=student_in.metrics.previous_failures,
            notes=student_in.metrics.notes
        )
        db.add(met)
        db.commit()
        db.refresh(met)
        m_out = schemas.StudentMetricsOut.from_orm(met)

        # Trigger prediction
        settings = db.query(models.InstitutionSettings).first()
        high_th = settings.high_risk_threshold if settings else 0.70
        med_th = settings.medium_risk_threshold if settings else 0.40

        feats = {
            "attendance_rate": met.attendance_rate,
            "average_score": met.average_score,
            "recent_exam_score": met.recent_exam_score,
            "assignment_completion": met.assignment_completion,
            "engagement_score": met.engagement_score,
            "previous_failures": met.previous_failures
        }
        pred_res = ml_engine.predict_student_risk(feats, high_th, med_th)

        pred_obj = models.Prediction(
            student_id=new_stu.id,
            risk_level=pred_res["risk_level"],
            risk_score=pred_res["risk_score"],
            confidence_score=pred_res["confidence_score"],
            model_version=pred_res["model_version"],
            is_what_if=False,
            contributing_factors=json.dumps(pred_res["contributing_factors"]),
            created_by_user_id=current_user.id
        )
        db.add(pred_obj)
        db.commit()
        db.refresh(pred_obj)

        p_out = schemas.PredictionOut(
            id=pred_obj.id,
            student_id=pred_obj.student_id,
            risk_level=pred_obj.risk_level,
            risk_score=pred_obj.risk_score,
            confidence_score=pred_obj.confidence_score,
            model_version=pred_obj.model_version,
            is_what_if=pred_obj.is_what_if,
            contributing_factors=pred_res["contributing_factors"],
            created_at=pred_obj.created_at
        )

    # Audit log
    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="STUDENT_CREATE",
        entity_type="Student",
        entity_id=new_stu.student_id,
        details=f"Created student record {new_stu.first_name} {new_stu.last_name}"
    ))
    db.commit()

    return schemas.StudentOut(
        id=new_stu.id,
        student_id=new_stu.student_id,
        first_name=new_stu.first_name,
        last_name=new_stu.last_name,
        email=new_stu.email,
        stage=new_stu.stage,
        department=new_stu.department,
        semester=new_stu.semester,
        enrollment_year=new_stu.enrollment_year,
        status=new_stu.status,
        created_at=new_stu.created_at,
        updated_at=new_stu.updated_at,
        latest_metrics=m_out,
        latest_prediction=p_out,
        active_interventions_count=0,
        pending_followups_count=0
    )

@router.get("/{id}", response_model=schemas.StudentDetailOut)
def get_student_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    metrics_objs = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == id).order_by(desc(models.StudentMetrics.recorded_at)).all()
    prediction_objs = db.query(models.Prediction).filter(
        models.Prediction.student_id == id,
        models.Prediction.is_what_if == False
    ).order_by(desc(models.Prediction.created_at)).all()
    intervention_objs = db.query(models.Intervention).filter(models.Intervention.student_id == id).order_by(desc(models.Intervention.created_at)).all()
    followup_objs = db.query(models.Followup).filter(models.Followup.student_id == id).order_by(desc(models.Followup.scheduled_date)).all()

    # Formatted predictions
    preds_out = []
    for p in prediction_objs:
        factors = []
        try:
            factors = json.loads(p.contributing_factors)
        except Exception:
            factors = []
        preds_out.append(schemas.PredictionOut(
            id=p.id,
            student_id=p.student_id,
            risk_level=p.risk_level,
            risk_score=p.risk_score,
            confidence_score=p.confidence_score,
            model_version=p.model_version,
            is_what_if=p.is_what_if,
            contributing_factors=factors,
            created_at=p.created_at
        ))

    intervs_out = []
    for it in intervention_objs:
        it_follows = [schemas.FollowupOut.from_orm(f) for f in it.followups]
        intervs_out.append(schemas.InterventionOut(
            id=it.id,
            student_id=it.student_id,
            category=it.category,
            priority=it.priority,
            title=it.title,
            action_plan=it.action_plan,
            assigned_to_id=it.assigned_to_id,
            due_date=it.due_date,
            status=it.status,
            notes=it.notes,
            created_at=it.created_at,
            updated_at=it.updated_at,
            student_name=f"{student.first_name} {student.last_name}",
            student_code=student.student_id,
            assignee_name=it.assignee.full_name if it.assignee else "Unassigned",
            followups=it_follows
        ))

    follows_out = []
    for f in followup_objs:
        follows_out.append(schemas.FollowupOut(
            id=f.id,
            intervention_id=f.intervention_id,
            student_id=f.student_id,
            scheduled_date=f.scheduled_date,
            status=f.status,
            outcome_notes=f.outcome_notes,
            risk_change_observed=f.risk_change_observed,
            completed_at=f.completed_at,
            created_at=f.created_at,
            intervention_title=f.intervention.title if f.intervention else "",
            student_name=f"{student.first_name} {student.last_name}",
            student_code=student.student_id
        ))

    email_val = student.email
    if current_user.role == "viewer" and email_val:
        parts = email_val.split("@")
        email_val = f"{parts[0][:2]}***@{parts[1]}" if len(parts) == 2 else "***"

    return schemas.StudentDetailOut(
        id=student.id,
        student_id=student.student_id,
        first_name=student.first_name,
        last_name=student.last_name,
        email=email_val,
        stage=student.stage,
        department=student.department,
        semester=student.semester,
        enrollment_year=student.enrollment_year,
        status=student.status,
        created_at=student.created_at,
        updated_at=student.updated_at,
        metrics_history=[schemas.StudentMetricsOut.from_orm(m) for m in metrics_objs],
        predictions_history=preds_out,
        interventions=intervs_out,
        followups=follows_out
    )

@router.put("/{id}")
def update_student(
    id: int,
    student_in: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator"]))
):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, val in student_in.dict(exclude_unset=True).items():
        setattr(student, field, val)

    student.updated_at = datetime.datetime.utcnow()
    db.commit()

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="STUDENT_UPDATE",
        entity_type="Student",
        entity_id=student.student_id,
        details=f"Updated student profile fields"
    ))
    db.commit()

    return {"message": "Student updated successfully", "student_id": student.student_id}

@router.post("/{id}/metrics", response_model=schemas.PredictionOut)
def record_student_metrics(
    id: int,
    metrics_in: schemas.StudentMetricsCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator"]))
):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_metric = models.StudentMetrics(
        student_id=id,
        attendance_rate=metrics_in.attendance_rate,
        average_score=metrics_in.average_score,
        recent_exam_score=metrics_in.recent_exam_score,
        assignment_completion=metrics_in.assignment_completion,
        engagement_score=metrics_in.engagement_score,
        previous_failures=metrics_in.previous_failures,
        notes=metrics_in.notes
    )
    db.add(new_metric)
    db.commit()

    settings = db.query(models.InstitutionSettings).first()
    high_th = settings.high_risk_threshold if settings else 0.70
    med_th = settings.medium_risk_threshold if settings else 0.40

    feats = {
        "attendance_rate": metrics_in.attendance_rate,
        "average_score": metrics_in.average_score,
        "recent_exam_score": metrics_in.recent_exam_score,
        "assignment_completion": metrics_in.assignment_completion,
        "engagement_score": metrics_in.engagement_score,
        "previous_failures": metrics_in.previous_failures
    }
    pred_res = ml_engine.predict_student_risk(feats, high_th, med_th)

    pred_obj = models.Prediction(
        student_id=id,
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
        action="METRICS_RECORDED",
        entity_type="Student",
        entity_id=student.student_id,
        details=f"Recorded checkpoint metrics; new risk level: {pred_res['risk_level']} ({pred_res['risk_score']})"
    ))
    db.commit()
    db.refresh(pred_obj)

    return schemas.PredictionOut(
        id=pred_obj.id,
        student_id=pred_obj.student_id,
        risk_level=pred_obj.risk_level,
        risk_score=pred_obj.risk_score,
        confidence_score=pred_obj.confidence_score,
        model_version=pred_obj.model_version,
        is_what_if=pred_obj.is_what_if,
        contributing_factors=pred_res["contributing_factors"],
        created_at=pred_obj.created_at
    )
