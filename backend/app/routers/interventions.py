import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/interventions", tags=["Interventions"])

@router.get("", response_model=List[schemas.InterventionOut])
def get_interventions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    student_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Intervention)

    if status and status != "All":
        query = query.filter(models.Intervention.status == status)
    if priority and priority != "All":
        query = query.filter(models.Intervention.priority == priority)
    if category and category != "All":
        query = query.filter(models.Intervention.category == category)
    if student_id:
        query = query.filter(models.Intervention.student_id == student_id)

    intervs = query.order_by(desc(models.Intervention.created_at)).offset(skip).limit(limit).all()

    result = []
    for it in intervs:
        s = it.student
        follows = [schemas.FollowupOut.from_orm(f) for f in it.followups]
        result.append(schemas.InterventionOut(
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
            student_name=f"{s.first_name} {s.last_name}" if s else "Unknown",
            student_code=s.student_id if s else "N/A",
            assignee_name=it.assignee.full_name if it.assignee else "Unassigned",
            followups=follows
        ))

    return result

@router.post("", response_model=schemas.InterventionOut)
def create_intervention(
    it_in: schemas.InterventionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator", "counsellor"]))
):
    student = db.query(models.Student).filter(models.Student.id == it_in.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    assignee_id = it_in.assigned_to_id or current_user.id

    new_it = models.Intervention(
        student_id=it_in.student_id,
        category=it_in.category,
        priority=it_in.priority,
        title=it_in.title,
        action_plan=it_in.action_plan,
        assigned_to_id=assignee_id,
        due_date=it_in.due_date,
        status=it_in.status,
        notes=it_in.notes
    )
    db.add(new_it)
    db.commit()
    db.refresh(new_it)

    followups_created = []
    if it_in.followup_date:
        today = datetime.date.today()
        f_status = "Due Today" if it_in.followup_date == today else ("Overdue" if it_in.followup_date < today else "Upcoming")
        
        f_obj = models.Followup(
            intervention_id=new_it.id,
            student_id=it_in.student_id,
            scheduled_date=it_in.followup_date,
            status=f_status,
            created_by_id=current_user.id
        )
        db.add(f_obj)
        db.commit()
        db.refresh(f_obj)
        followups_created.append(schemas.FollowupOut.from_orm(f_obj))

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="INTERVENTION_CREATE",
        entity_type="Intervention",
        entity_id=str(new_it.id),
        details=f"Created intervention '{new_it.title}' for student {student.student_id}"
    ))
    db.commit()

    return schemas.InterventionOut(
        id=new_it.id,
        student_id=new_it.student_id,
        category=new_it.category,
        priority=new_it.priority,
        title=new_it.title,
        action_plan=new_it.action_plan,
        assigned_to_id=new_it.assigned_to_id,
        due_date=new_it.due_date,
        status=new_it.status,
        notes=new_it.notes,
        created_at=new_it.created_at,
        updated_at=new_it.updated_at,
        student_name=f"{student.first_name} {student.last_name}",
        student_code=student.student_id,
        assignee_name=new_it.assignee.full_name if new_it.assignee else "Unassigned",
        followups=followups_created
    )

@router.put("/{id}", response_model=schemas.InterventionOut)
def update_intervention(
    id: int,
    it_in: schemas.InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "educator", "counsellor"]))
):
    interv = db.query(models.Intervention).filter(models.Intervention.id == id).first()
    if not interv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    for field, val in it_in.dict(exclude_unset=True).items():
        setattr(interv, field, val)

    interv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(interv)

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="INTERVENTION_UPDATE",
        entity_type="Intervention",
        entity_id=str(interv.id),
        details=f"Updated intervention status to {interv.status}"
    ))
    db.commit()

    s = interv.student
    follows = [schemas.FollowupOut.from_orm(f) for f in interv.followups]

    return schemas.InterventionOut(
        id=interv.id,
        student_id=interv.student_id,
        category=interv.category,
        priority=interv.priority,
        title=interv.title,
        action_plan=interv.action_plan,
        assigned_to_id=interv.assigned_to_id,
        due_date=interv.due_date,
        status=interv.status,
        notes=interv.notes,
        created_at=interv.created_at,
        updated_at=interv.updated_at,
        student_name=f"{s.first_name} {s.last_name}" if s else "Unknown",
        student_code=s.student_id if s else "N/A",
        assignee_name=interv.assignee.full_name if interv.assignee else "Unassigned",
        followups=follows
    )
