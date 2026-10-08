import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/students-csv")
def export_students_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    students = db.query(models.Student).all()
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Student ID", "First Name", "Last Name", "Stage", "Department",
        "Semester", "Status", "Attendance %", "Average Score %",
        "Recent Exam %", "Assignment %", "Engagement %", "Backlogs",
        "Risk Level", "Risk Score", "Prediction Date"
    ])

    for s in students:
        m = db.query(models.StudentMetrics).filter(models.StudentMetrics.student_id == s.id).order_by(desc(models.StudentMetrics.recorded_at)).first()
        p = db.query(models.Prediction).filter(models.Prediction.student_id == s.id, models.Prediction.is_what_if == False).order_by(desc(models.Prediction.created_at)).first()

        writer.writerow([
            s.student_id,
            s.first_name,
            s.last_name,
            s.stage,
            s.department,
            s.semester,
            s.status,
            m.attendance_rate if m else "",
            m.average_score if m else "",
            m.recent_exam_score if m else "",
            m.assignment_completion if m else "",
            m.engagement_score if m else "",
            m.previous_failures if m else 0,
            p.risk_level if p else "N/A",
            p.risk_score if p else "N/A",
            p.created_at.strftime("%Y-%m-%d %H:%M") if p else ""
        ])

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="EXPORT_REPORT",
        entity_type="Report",
        entity_id="students-csv",
        details="Exported students roster CSV report"
    ))
    db.commit()

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=eduguard_students_report.csv"}
    )

@router.get("/interventions-csv")
def export_interventions_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    interventions = db.query(models.Intervention).all()
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Intervention ID", "Student ID", "Student Name", "Category", "Priority",
        "Title", "Status", "Assignee", "Due Date", "Created Date", "Notes"
    ])

    for it in interventions:
        s = it.student
        writer.writerow([
            f"INT-{it.id}",
            s.student_id if s else "N/A",
            f"{s.first_name} {s.last_name}" if s else "N/A",
            it.category,
            it.priority,
            it.title,
            it.status,
            it.assignee.full_name if it.assignee else "Unassigned",
            it.due_date.strftime("%Y-%m-%d") if it.due_date else "",
            it.created_at.strftime("%Y-%m-%d") if it.created_at else "",
            it.notes or ""
        ])

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="EXPORT_REPORT",
        entity_type="Report",
        entity_id="interventions-csv",
        details="Exported interventions tracking CSV report"
    ))
    db.commit()

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=eduguard_interventions_report.csv"}
    )
