import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            if "text/csv" in resp.headers.get("Content-Type", ""):
                return resp.status, "CSV_DATA"
            return resp.status, json.loads(content.decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")

def run_tests():
    print("=== STARTING EDUGUARD AI SYSTEM VERIFICATION ===")
    
    # 1. Health
    status, res = make_req("/health")
    assert status == 200, f"Health failed: {status}"
    print("PASS: Health Check")

    # 2. Login all 4 roles
    roles = [
        ("admin@eduguard.edu", "Admin@123", "admin"),
        ("educator@eduguard.edu", "Educator@123", "educator"),
        ("counsellor@eduguard.edu", "Counsellor@123", "counsellor"),
        ("viewer@eduguard.edu", "Viewer@123", "viewer"),
    ]
    tokens = {}
    for email, pwd, role in roles:
        status, res = make_req("/auth/login", method="POST", data={"email": email, "password": pwd})
        assert status == 200, f"Login {role} failed: {status} {res}"
        tokens[role] = res["access_token"]
        print(f"PASS: Login Persona [{role}] -> {res['user']['full_name']}")

    admin_token = tokens["admin"]

    # 3. Dashboard Summary & Trends
    status, sum_res = make_req("/dashboard/summary", token=admin_token)
    assert status == 200 and sum_res["total_students"] > 0, f"Dashboard summary failed: {sum_res}"
    print(f"PASS: Dashboard Summary ({sum_res['total_students']} students, High: {sum_res['high_risk_count']}, Med: {sum_res['medium_risk_count']})")

    status, trend_res = make_req("/dashboard/trends", token=admin_token)
    assert status == 200 and len(trend_res) > 0, "Dashboard trends failed"
    print("PASS: Dashboard Temporal Trends")

    # 4. Students Roster & Detail
    status, stu_list = make_req("/students", token=admin_token)
    assert status == 200 and len(stu_list) > 0, "Students roster failed"
    target_id = stu_list[0]["id"]
    print(f"PASS: Students Roster ({len(stu_list)} loaded)")

    status, stu_det = make_req(f"/students/{target_id}", token=admin_token)
    assert status == 200 and stu_det["student_id"] is not None, "Student detail failed"
    print(f"PASS: Student Detail [{stu_det['student_id']}] ({stu_det['first_name']} {stu_det['last_name']})")

    # 5. What-If Simulator
    what_if_payload = {
        "student_id": target_id,
        "attendance_rate": 88.0,
        "average_score": 78.0,
        "recent_exam_score": 75.0,
        "assignment_completion": 90.0,
        "engagement_score": 80.0,
        "previous_failures": 0
    }
    status, what_if_res = make_req("/what-if", method="POST", data=what_if_payload, token=admin_token)
    assert status == 200 and "simulated_risk_score" in what_if_res, f"What-If failed: {what_if_res}"
    print(f"PASS: What-If Simulation (Baseline: {what_if_res['baseline_risk_score']} -> Simulated: {what_if_res['simulated_risk_score']}, Diff: {what_if_res['risk_difference']})")

    # 6. Interventions & Follow-ups
    status, intervs = make_req("/interventions", token=admin_token)
    assert status == 200 and len(intervs) > 0, "Interventions list failed"
    print(f"PASS: Interventions Registry ({len(intervs)} records)")

    status, follows = make_req("/followups", token=admin_token)
    assert status == 200 and len(follows) > 0, "Followups list failed"
    target_f_id = follows[0]["id"]
    print(f"PASS: Followups Registry ({len(follows)} records)")

    status, update_f = make_req(f"/followups/{target_f_id}", method="PUT", data={"status": "Completed", "outcome_notes": "Followup tested by QA verification script", "risk_change_observed": "Improved"}, token=admin_token)
    assert status == 200 and update_f["status"] == "Completed", "Followup update failed"
    print("PASS: Followup Outcome Update & Trajectory Recording")

    # 7. Machine Learning Models
    status, models_list = make_req("/models", token=admin_token)
    assert status == 200 and len(models_list) >= 4, f"Models check failed: {models_list}"
    active_m = [m for m in models_list if m["is_active"]][0]
    print(f"PASS: ML Models Evaluation (Active: {active_m['model_name']}, F1: {active_m['f1_score']}, ROC-AUC: {active_m['roc_auc']})")

    # 8. Analytics
    status, st_comp = make_req("/analytics/stage-comparison", token=admin_token)
    assert status == 200 and len(st_comp) > 0, "Stage comparison failed"
    status, att_vs_r = make_req("/analytics/attendance-vs-risk", token=admin_token)
    assert status == 200 and len(att_vs_r) > 0, "Attendance vs risk failed"
    status, eff_res = make_req("/analytics/intervention-effectiveness", token=admin_token)
    assert status == 200 and "improvement_rate_pct" in eff_res, "Intervention effectiveness failed"
    print("PASS: Institutional Analytics Endpoints")

    # 9. Reports CSV
    status, csv_data = make_req("/reports/students-csv", token=admin_token)
    assert status == 200, "CSV students export failed"
    status, csv_interv = make_req("/reports/interventions-csv", token=admin_token)
    assert status == 200, "CSV interventions export failed"
    print("PASS: Reports CSV Exports")

    # 10. Settings & Audit Logs
    status, sett = make_req("/settings", token=admin_token)
    assert status == 200 and "high_risk_threshold" in sett, "Settings failed"
    status, audits = make_req("/audit-logs", token=admin_token)
    assert status == 200 and len(audits) > 0, "Audit logs failed"
    print(f"PASS: Settings & Admin Audit Logs ({len(audits)} audit logs present)")

    # 11. Role Authorization boundary check (Viewer should be blocked from audit-logs)
    viewer_token = tokens["viewer"]
    status, viewer_audit = make_req("/audit-logs", token=viewer_token)
    assert status == 403, f"Viewer role access control failed: expected 403, got {status}"
    print("PASS: Role Authorization Boundary (Viewer 403 Forbidden on Audit Logs)")

    print("\nALL BACKEND API & DATA CHECKS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
