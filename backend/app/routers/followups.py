import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/followups", tags=["Follow-ups"])

@router.get("", response_model=List[schemas.FollowupOut])
def get_followups(
    status: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Followup)

    today = datetime.date.today()
    if status:
        if status == "Due Today":
            query = query.filter(models.Followup.scheduled_date == today, models.Followup.status != "Completed")
        elif status == "Overdue":
            query = query.filter(models.Followup.scheduled_date < today, models.Followup.status != "Completed")
        elif status == "Upcoming":
            query = query.filter(models.Followup.scheduled_date > today, models.Followup.status != "Completed")
        elif status == "Completed":
            query = query.filter(models.Followup.status == "Completed")

    if student_id:
        query = query.filter(models.Followup.student_id == student_id)

    followups = query.order_by(models.Followup.scheduled_date.asc()).all()

    result = []
    for f in followups:
        s = f.student
        it = f.intervention
        result.append(schemas.FollowupOut(
            id=f.id,
            intervention_id=f.intervention_id,
            student_id=f.student_id,
            scheduled_date=f.scheduled_date,
            status=f.status,
            outcome_notes=f.outcome_notes,
            risk_change_observed=f.risk_change_observed,
            completed_at=f.completed_at,
            created_at=f.created_at,
            intervention_title=it.title if it else "",
            student_name=f"{s.first_name} {s.last_name}" if s else "Unknown",
            student_code=s.student_id if s else "N/A"
        ))
    return result

@router.post("", response_model=schemas.FollowupOut)
def create_followup(
    f_in: schemas.FollowupCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator", "counsellor"]))
):
    today = datetime.date.today()
    f_status = "Due Today" if f_in.scheduled_date == today else ("Overdue" if f_in.scheduled_date < today else "Upcoming")

    new_f = models.Followup(
        intervention_id=f_in.intervention_id,
        student_id=f_in.student_id,
        scheduled_date=f_in.scheduled_date,
        status=f_status,
        outcome_notes=f_in.outcome_notes,
        risk_change_observed=f_in.risk_change_observed,
        created_by_id=current_user.id
    )
    db.add(new_f)
    db.commit()
    db.refresh(new_f)

    s = new_f.student
    it = new_f.intervention
    return schemas.FollowupOut(
        id=new_f.id,
        intervention_id=new_f.intervention_id,
        student_id=new_f.student_id,
        scheduled_date=new_f.scheduled_date,
        status=new_f.status,
        outcome_notes=new_f.outcome_notes,
        risk_change_observed=new_f.risk_change_observed,
        completed_at=new_f.completed_at,
        created_at=new_f.created_at,
        intervention_title=it.title if it else "",
        student_name=f"{s.first_name} {s.last_name}" if s else "",
        student_code=s.student_id if s else ""
    )

@router.put("/{id}", response_model=schemas.FollowupOut)
def update_followup(
    id: int,
    f_in: schemas.FollowupUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator", "counsellor"]))
):
    follow = db.query(models.Followup).filter(models.Followup.id == id).first()
    if not follow:
        raise HTTPException(status_code=404, detail="Followup not found")

    for field, val in f_in.dict(exclude_unset=True).items():
        setattr(follow, field, val)

    if f_in.status == "Completed" and not follow.completed_at:
        follow.completed_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(follow)

    s = follow.student
    it = follow.intervention

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="FOLLOWUP_UPDATE",
        entity_type="Followup",
        entity_id=str(follow.id),
        details=f"Followup updated: status={follow.status}, risk_change={follow.risk_change_observed}"
    ))
    db.commit()

    return schemas.FollowupOut(
        id=follow.id,
        intervention_id=follow.intervention_id,
        student_id=follow.student_id,
        scheduled_date=follow.scheduled_date,
        status=follow.status,
        outcome_notes=follow.outcome_notes,
        risk_change_observed=follow.risk_change_observed,
        completed_at=follow.completed_at,
        created_at=follow.created_at,
        intervention_title=it.title if it else "",
        student_name=f"{s.first_name} {s.last_name}" if s else "",
        student_code=s.student_id if s else ""
    )
