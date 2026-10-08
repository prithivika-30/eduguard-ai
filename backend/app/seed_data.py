import os
import json
import datetime
from sqlalchemy.orm import Session
from app import models, auth, ml_engine

def seed_database(db: Session):
    # Check if already seeded
    if db.query(models.User).first():
        return

    print("Seeding initial EduGuard AI database...")

    # 1. Institution Settings
    settings = models.InstitutionSettings(
        institution_name="Apex National University & Academy",
        high_risk_threshold=0.70,
        medium_risk_threshold=0.40,
        academic_term="Fall Term 2026",
        notification_channels="email,in-app,sms",
        data_retention_days=365
    )
    db.add(settings)
    db.commit()

    # 2. Roles and Demo Users
    users_data = [
        {
            "email": "admin@eduguard.edu",
            "full_name": "Dr. Eleanor Vance (Dean)",
            "role": "admin",
            "department": "Institutional Research & Academic Affairs",
            "password": "Admin@123"
        },
        {
            "email": "educator@eduguard.edu",
            "full_name": "Prof. Marcus Thorne",
            "role": "educator",
            "department": "Computer Science & Engineering",
            "password": "Educator@123"
        },
        {
            "email": "counsellor@eduguard.edu",
            "full_name": "Sarah Jenkins (Licensed Counsellor)",
            "role": "counsellor",
            "department": "Student Support & Welfare Services",
            "password": "Counsellor@123"
        },
        {
            "email": "viewer@eduguard.edu",
            "full_name": "David Sterling (Governing Board)",
            "role": "viewer",
            "department": "Executive Management",
            "password": "Viewer@123"
        }
    ]

    created_users = {}
    for u in users_data:
        user_obj = models.User(
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            department=u["department"],
            hashed_password=auth.get_password_hash(u["password"])
        )
        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)
        created_users[u["role"]] = user_obj

    # 3. Train ML Models first to ensure real model artifacts exist
    print("Training candidate machine learning models...")
    ml_engine.train_and_evaluate_all_models()

    # Also record model versions in database
    if os.path.exists(ml_engine.META_FILE):
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

    # 4. Realistic Student Population
    raw_students = [
        # HIGH RISK COHORT
        ("STU-2026-101", "Aiden", "Cruz", "aiden.cruz@apex.edu", "Undergraduate", "Computer Science", 3, 2025, 52.4, 48.0, 42.5, 50.0, 38.0, 2),
        ("STU-2026-102", "Maya", "Patel", "maya.patel@apex.edu", "Higher Secondary", "Science Stream", 2, 2025, 58.0, 52.5, 45.0, 60.0, 42.0, 2),
        ("STU-2026-103", "Liam", "Chen", "liam.chen@apex.edu", "Undergraduate", "Data Science", 4, 2024, 61.2, 54.0, 48.0, 55.0, 44.0, 1),
        ("STU-2026-104", "Fatima", "Al-Mansoor", "fatima.al@apex.edu", "Undergraduate", "Electrical Engineering", 2, 2025, 49.5, 46.2, 40.0, 45.0, 32.0, 3),
        ("STU-2026-105", "Carlos", "Santos", "carlos.santos@apex.edu", "School", "High School Senior", 1, 2026, 63.0, 55.0, 50.0, 62.0, 48.0, 1),
        ("STU-2026-106", "Zoe", "Kowalski", "zoe.k@apex.edu", "Undergraduate", "Business Administration", 3, 2025, 55.0, 49.0, 44.0, 52.0, 39.0, 2),
        ("STU-2026-107", "Dante", "Russo", "dante.russo@apex.edu", "Other", "Applied Robotics Diploma", 2, 2025, 59.5, 53.0, 47.0, 58.0, 41.0, 1),

        # MEDIUM RISK COHORT
        ("STU-2026-201", "Noah", "Kim", "noah.kim@apex.edu", "Undergraduate", "Mechanical Engineering", 3, 2025, 72.5, 64.0, 58.5, 75.0, 60.0, 0),
        ("STU-2026-202", "Elena", "Rostova", "elena.r@apex.edu", "Undergraduate", "Computer Science", 2, 2025, 74.0, 66.5, 60.0, 78.0, 62.0, 0),
        ("STU-2026-203", "Jordan", "Taylor", "jordan.t@apex.edu", "Higher Secondary", "Commerce Stream", 2, 2025, 70.0, 62.0, 56.0, 72.0, 58.0, 1),
        ("STU-2026-204", "Priya", "Nair", "priya.nair@apex.edu", "School", "Secondary Grade 10", 1, 2026, 76.0, 68.0, 62.0, 80.0, 65.0, 0),
        ("STU-2026-205", "Lucas", "Dubois", "lucas.dubois@apex.edu", "Undergraduate", "Data Science", 4, 2024, 71.0, 63.5, 59.0, 74.0, 59.0, 1),
        ("STU-2026-206", "Amara", "Okonkwo", "amara.o@apex.edu", "Undergraduate", "Biotechnology", 2, 2025, 75.5, 67.0, 61.0, 79.0, 63.0, 0),
        ("STU-2026-207", "Ethan", "Wright", "ethan.w@apex.edu", "Higher Secondary", "Humanities", 1, 2026, 69.5, 61.0, 57.0, 70.0, 55.0, 1),
        ("STU-2026-208", "Sofia", "Mendoza", "sofia.m@apex.edu", "Other", "Advanced Graphic Design", 2, 2025, 73.0, 65.0, 60.5, 76.0, 61.0, 0),

        # LOW RISK COHORT
        ("STU-2026-301", "Emma", "Watson-Hall", "emma.wh@apex.edu", "Undergraduate", "Computer Science", 4, 2024, 94.5, 89.0, 92.0, 98.0, 92.0, 0),
        ("STU-2026-302", "Ravi", "Verma", "ravi.verma@apex.edu", "Undergraduate", "Data Science", 3, 2025, 91.0, 86.5, 88.0, 95.0, 88.0, 0),
        ("STU-2026-303", "Chloe", "Bennett", "chloe.b@apex.edu", "Higher Secondary", "Science Stream", 2, 2025, 93.0, 88.0, 90.5, 96.0, 90.0, 0),
        ("STU-2026-304", "Hassan", "Ibrahim", "hassan.i@apex.edu", "Undergraduate", "Mechanical Engineering", 2, 2025, 88.5, 82.0, 84.0, 92.0, 85.0, 0),
        ("STU-2026-305", "Grace", "Hopper-Lee", "grace.hl@apex.edu", "School", "Secondary Grade 10", 1, 2026, 96.0, 94.0, 95.0, 100.0, 95.0, 0),
        ("STU-2026-306", "Oliver", "Smith", "oliver.smith@apex.edu", "Undergraduate", "Business Administration", 3, 2025, 87.0, 80.5, 82.0, 90.0, 83.0, 0),
        ("STU-2026-307", "Ananya", "Deshmukh", "ananya.d@apex.edu", "Undergraduate", "Biotechnology", 1, 2026, 92.0, 87.0, 89.0, 96.0, 89.0, 0),
        ("STU-2026-308", "Benjamin", "Fischer", "benjamin.f@apex.edu", "Undergraduate", "Electrical Engineering", 4, 2024, 89.0, 83.0, 85.0, 93.0, 86.0, 0),
        ("STU-2026-309", "Isabella", "Garcia", "isabella.g@apex.edu", "Higher Secondary", "Commerce Stream", 2, 2025, 90.5, 85.0, 86.0, 94.0, 87.0, 0),
        ("STU-2026-310", "Tariq", "Ziyad", "tariq.z@apex.edu", "School", "High School Junior", 2, 2025, 86.0, 81.0, 83.0, 89.0, 82.0, 0)
    ]

    saved_students = []
    for s in raw_students:
        stu = models.Student(
            student_id=s[0],
            first_name=s[1],
            last_name=s[2],
            email=s[3],
            stage=s[4],
            department=s[5],
            semester=s[6],
            enrollment_year=s[7],
            status="Active"
        )
        db.add(stu)
        db.commit()
        db.refresh(stu)
        saved_students.append((stu, s[8], s[9], s[10], s[11], s[12], s[13]))

    # Add metrics and run genuine predictions for each student
    for stu, att, avg_s, rec_ex, assg, eng, fail in saved_students:
        metric = models.StudentMetrics(
            student_id=stu.id,
            attendance_rate=att,
            average_score=avg_s,
            recent_exam_score=rec_ex,
            assignment_completion=assg,
            engagement_score=eng,
            previous_failures=fail,
            recorded_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(metric)
        db.commit()

        # Compute real prediction
        feats = {
            "attendance_rate": att,
            "average_score": avg_s,
            "recent_exam_score": rec_ex,
            "assignment_completion": assg,
            "engagement_score": eng,
            "previous_failures": fail
        }
        pred_res = ml_engine.predict_student_risk(feats, settings.high_risk_threshold, settings.medium_risk_threshold)
        
        pred = models.Prediction(
            student_id=stu.id,
            risk_level=pred_res["risk_level"],
            risk_score=pred_res["risk_score"],
            confidence_score=pred_res["confidence_score"],
            model_version=pred_res["model_version"],
            is_what_if=False,
            contributing_factors=json.dumps(pred_res["contributing_factors"]),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(pred)
        db.commit()

    # 5. Create Sample Interventions for High and Medium Risk Students
    interventions_plan = [
        {
            "stu_code": "STU-2026-101",
            "category": "Academic Support",
            "priority": "High",
            "title": "Mandatory Peer Tutoring & Algorithm Remedial Workshop",
            "action_plan": "Assign senior tutor for Data Structures; weekly problem-solving check-ins; monitor homework submission.",
            "due_days": 10,
            "status": "In Progress",
            "assignee": created_users["educator"].id,
            "followup": {"days": 0, "status": "Due Today", "outcome": "First two tutoring sessions completed. Student showed comprehension improvements.", "risk": "Improved"}
        },
        {
            "stu_code": "STU-2026-102",
            "category": "Attendance Support",
            "priority": "High",
            "title": "Attendance Contract & Parent Notification Protocol",
            "action_plan": "Bi-weekly attendance check with counsellor; morning bus route verification; daily check-in with homeroom mentor.",
            "due_days": 5,
            "status": "In Progress",
            "assignee": created_users["counsellor"].id,
            "followup": {"days": -2, "status": "Overdue", "outcome": "Parent meeting rescheduled due to family work constraints.", "risk": "Worsened"}
        },
        {
            "stu_code": "STU-2026-103",
            "category": "Mentoring",
            "priority": "High",
            "title": "Faculty Mentor 1-on-1 Academic Goal Calibration",
            "action_plan": "Set up bi-weekly milestone roadmap; evaluate project backlog; break capstone into manageable milestones.",
            "due_days": 14,
            "status": "In Progress",
            "assignee": created_users["educator"].id,
            "followup": {"days": 3, "status": "Upcoming", "outcome": None, "risk": None}
        },
        {
            "stu_code": "STU-2026-104",
            "category": "Counselling Referral",
            "priority": "High",
            "title": "Academic Anxiety & Stress Management Sessions",
            "action_plan": "Schedule 4 weekly sessions with institutional counselling center; coordinate with department for exam accommodation.",
            "due_days": 21,
            "status": "Planned",
            "assignee": created_users["counsellor"].id,
            "followup": {"days": 1, "status": "Upcoming", "outcome": None, "risk": None}
        },
        {
            "stu_code": "STU-2026-106",
            "category": "Financial/Resource Referral",
            "priority": "Medium",
            "title": "Emergency Textbook Grant & Laptop Loan Allocation",
            "action_plan": "Connect student with Student Welfare fund for digital device loan and required textbook vouchers.",
            "due_days": 7,
            "status": "Completed",
            "assignee": created_users["admin"].id,
            "followup": {"days": -7, "status": "Completed", "outcome": "Device issued on loan; student now accessing all digital portal materials.", "risk": "Improved"}
        },
        {
            "stu_code": "STU-2026-201",
            "category": "Mentoring",
            "priority": "Medium",
            "title": "Midterm Exam Review & Study Group Pairing",
            "action_plan": "Pair with study group in Fluid Mechanics; schedule 2 check-ins prior to upcoming internal assessment.",
            "due_days": 12,
            "status": "In Progress",
            "assignee": created_users["educator"].id,
            "followup": {"days": 4, "status": "Upcoming", "outcome": None, "risk": None}
        }
    ]

    for item in interventions_plan:
        student_obj = db.query(models.Student).filter(models.Student.student_id == item["stu_code"]).first()
        if student_obj:
            today = datetime.date.today()
            interv = models.Intervention(
                student_id=student_obj.id,
                category=item["category"],
                priority=item["priority"],
                title=item["title"],
                action_plan=item["action_plan"],
                assigned_to_id=item["assignee"],
                due_date=today + datetime.timedelta(days=item["due_days"]),
                status=item["status"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
            )
            db.add(interv)
            db.commit()
            db.refresh(interv)

            # Follow-up
            f_data = item["followup"]
            follow = models.Followup(
                intervention_id=interv.id,
                student_id=student_obj.id,
                scheduled_date=today + datetime.timedelta(days=f_data["days"]),
                status=f_data["status"],
                outcome_notes=f_data["outcome"],
                risk_change_observed=f_data["risk"],
                completed_at=datetime.datetime.utcnow() if f_data["status"] == "Completed" else None
            )
            db.add(follow)
            db.commit()

    # 6. Seed Dataset History record
    dataset_rec = models.Dataset(
        filename="Apex_Cohort_Baseline_2026.csv",
        row_count=1200,
        data_quality_score=97.5,
        missing_rate=0.015,
        duplicate_count=0,
        invalid_ranges_count=0,
        status="Good",
        validation_details=json.dumps({
            "required_columns_found": 8,
            "missing_values_handled": 18,
            "schema_verified": True
        }),
        uploaded_by_id=created_users["admin"].id
    )
    db.add(dataset_rec)

    # 7. Seed Audit Logs
    audit_entries = [
        ("LOGIN", "User", str(created_users['admin'].id), "Admin login successful"),
        ("MODEL_TRAIN", "Model", "Gradient Boosting", "Trained ensemble models on baseline dataset"),
        ("DATA_IMPORT", "Dataset", "Apex_Cohort_Baseline_2026.csv", "Imported 1,200 validated student records"),
        ("INTERVENTION_CREATE", "Intervention", "STU-2026-101", "Created peer tutoring intervention for Aiden Cruz"),
        ("PREDICTION_RUN", "Student", "STU-2026-101", "Model prediction generated: High Risk (0.842)")
    ]

    for act, ent_t, ent_id, detail in audit_entries:
        log = models.AuditLog(
            user_id=created_users['admin'].id,
            user_email="admin@eduguard.edu",
            action=act,
            entity_type=ent_t,
            entity_id=ent_id,
            details=detail,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        )
        db.add(log)
    db.commit()

    print("Database seeding completed successfully.")
