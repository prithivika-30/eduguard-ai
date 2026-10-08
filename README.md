# EduGuard AI — Student Dropout Early Warning & Intervention System

> **"Predict risk earlier. Support students sooner."**

EduGuard AI is a full-stack, production-style decision-support web application that helps educational institutions identify students at risk of dropping out, understand contributing factors through Explainable AI (XAI), run real-time **What-If scenario simulations**, prioritize personalized interventions, track follow-up outcomes, and monitor temporal risk change over time.

---

## 🌟 Core Innovation: The Closed-Loop Early Warning Architecture

```
DATA → DATA QUALITY → RISK PREDICTION → RISK LEVEL → CONTRIBUTING FACTORS → INTERVENTION PLAN → FOLLOW-UP → RISK CHANGE → MONITORING
```

### Key Differentiators
1. **Multi-Factor Student Risk Analysis:** Integrates attendance trajectory, cumulative GPA, recent midterm exam shifts, assignment completion rates, LMS engagement indices, and historical course backlogs.
2. **Stage-Aware Risk Interpretation:** Adapts benchmarks and indicators across School, Higher Secondary, and Undergraduate degree levels.
3. **Explainable AI (XAI) Factor Contributions:** Replaces black-box probability scores with clear feature importance rankings and relative benchmark deviations ("Why this prediction?").
4. **Interactive What-If Simulation (Novelty Feature):** Allows educators to adjust controllable indicators (e.g. +15% attendance) and observe the simulated model response in real time. Clearly labeled as a *scenario estimate without claiming causal certainty*.
5. **Closed-Loop Intervention & Follow-up Tracking:** Bridges algorithmic predictions directly to human educator actions across support categories (Tutoring, Attendance Contracts, Mentoring, Counselling Referrals, Resource Assistance) and documents qualitative outcomes.
6. **Data Quality & Schema Completeness Scoring:** Evaluates uploaded CSV datasets for missing rates, duplicate student IDs, out-of-range values, and overall schema health before database ingestion.
7. **Role-Based Access Control (RBAC):** Custom role views for Administrators, Faculty/Educators, Counsellors, and Board Viewers with automatic privacy masking of student contact information.
8. **Real Scikit-Learn Ensemble Pipeline:** Actively trains and benchmarks 4 candidate algorithms (Gradient Boosting, Random Forest, Decision Tree, Logistic Regression) on holdout test splits (25%). No hardcoded or fabricated metrics.
9. **Responsible AI by Design:** Human-in-the-loop decision support. AI never makes autonomous punitive actions or permanent labelling judgements.

---

## 🌐 Public Live Deployment

EduGuard AI is deployed live and publicly accessible worldwide across any mobile device or desktop browser:

- 📱 **Public Web Application:** [https://9a4a3f7d6eb6c3.lhr.life](https://9a4a3f7d6eb6c3.lhr.life)
- 🔌 **Dedicated REST API & Interactive Swagger Docs:** [https://d199543f43f7d1.lhr.life/docs](https://d199543f43f7d1.lhr.life/docs)
- 📡 **Backend Health Check:** [https://d199543f43f7d1.lhr.life/api/health](https://d199543f43f7d1.lhr.life/api/health)

### Cloud Deployment Blueprints Included
The repository contains ready-to-deploy cloud configurations:
- `backend/Dockerfile`: Production Python container specification.
- `render.yaml`: Infrastructure as Code (IaC) blueprint for deploying the FastAPI backend and React frontend.
- `frontend/vercel.json`: Vercel Single-Page Application (SPA) rewrite and routing configuration.

---

## 🚀 Live Demo Credentials

Use the single-click **Persona Switcher** in the top navigation bar or enter credentials manually:

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eduguard.edu` | `Admin@123` | Dean / Research: Full access, datasets, model retraining, audit trails, risk thresholds |
| **Educator / Faculty** | `educator@eduguard.edu` | `Educator@123` | Course Instructor: Student roster, predictions, What-If simulation, intervention creation |
| **Counsellor / Mentor** | `counsellor@eduguard.edu` | `Counsellor@123` | Student Welfare: Prioritized high-risk triage queue, interventions, follow-up check-ins |
| **Viewer / Management** | `viewer@eduguard.edu` | `Viewer@123` | Governing Board: Aggregate institutional analytics, reports (student emails automatically masked) |

---

## 🧭 Hackathon Judge Walkthrough Guide

Follow this 8-step journey to evaluate the end-to-end platform:

1. **Sign In (`/login`):** Click any of the 4 role pills to log in instantly.
2. **Dashboard Overview (`/dashboard`):** Review real KPI cards (Attention Required, High/Medium/Low counts), risk distribution donut chart, 4-period temporal trend line, and priority triage queue.
3. **High-Risk Triage Queue (`/risks`):** Inspect prioritized students with model risk probabilities, top contributing factors, and immediate triage actions.
4. **Student Profile & Explainability (`/students/1`):** Open **Aiden Cruz (STU-2026-101)**. Inspect multi-factor indicators, the **Why this prediction?** panel with relative impact directions, and model reliability confidence index.
5. **What-If Risk Simulation (`/what-if`):** Drag attendance from 52% to 80% or remove backlogs and click **Calculate What-If Scenario**. Observe the real-time probability shift ($\Delta\text{ Risk Score}$) and changed factor weights.
6. **Support Interventions (`/interventions`):** Review active peer tutoring and mentoring plans. Filter by category, priority, and update statuses.
7. **Follow-ups & Outcome Logging (`/follow-up`):** Click **Log Outcome** on a due check-in, record qualitative notes, and classify observed trajectory as **Improved**, **No Change**, or **Worsened**.
8. **Model Evaluation & Retraining (`/models`):** Inspect the 4 candidate models evaluated on real test sets (Accuracy, Recall, F1, ROC-AUC) and click **Retrain All Candidate Models** to trigger a real retraining cycle.
9. **Data Validation & CSV Ingestion (`/data`):** Upload `sample_data/sample_students.csv` to observe automatic data quality scoring, missing-value rate check, column mapping preview, and batch import.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Backend:** Python 3.13, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn, Python-Jose (JWT), Bcrypt
- **Machine Learning & Analytics:** Scikit-learn (GradientBoostingClassifier, RandomForestClassifier, DecisionTreeClassifier, LogisticRegression), Pandas, NumPy, Joblib
- **Database:** SQLite (normalized relational schema with foreign keys and indexes; ready for PostgreSQL migration)

---

## 💻 Setup & Run Instructions

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on `http://127.0.0.1:8000`. Database tables and initial baseline seeds are automatically provisioned on startup.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173`. API calls to `/api` are automatically proxied to the backend on port 8000.*

### 4. Automated Verification Test Suite
Run the automated verification script to test every API route, database CRUD operation, What-If simulation, model evaluation, and role permission boundary:
```bash
python verify_all.py
```

---

## 📊 Relational Database Architecture

- `users`: User authentication, roles, department, password hashes
- `institution_settings`: Configurable high/medium risk cutoffs, academic term, data retention
- `students`: Student demographics, stage (School, Higher Secondary, Undergraduate, Other), department, status
- `student_metrics`: Attendance rate, cumulative average, midterm score, assignment completion, LMS engagement, backlogs
- `predictions`: Model risk level, probability score (0-1), confidence rating, model version, JSON contributing factors
- `interventions`: Support categories, priority, action plan, assignee, due date, status
- `followups`: Check-in schedule, status, qualitative outcome notes, observed risk change
- `datasets`: Ingestion audit log, quality score (0-100), missing rate, validation metadata
- `model_versions`: Algorithm name, accuracy, precision, recall, F1-score, ROC-AUC, active status, feature importances
- `audit_logs`: User, timestamp, action, entity type, entity ID, audit detail

---

## ⚖️ Responsible AI & Ethical Framework

1. **Decision-Support Only:** EduGuard AI provides early signals to help mentors assist students sooner. A model prediction is not a final judgement on a student's potential.
2. **Non-Punitive Mandate:** Risk predictions must never be used to penalize, deny financial aid, withdraw enrollment, or restrict student opportunities.
3. **Statistical Association vs Causality:** Factor contributions represent statistical correlations relative to cohort averages; they do not prove causality. Educators must evaluate underlying life contexts.
4. **Data Privacy & Synthetic Data:** The default dataset consists of carefully modeled synthetic student records. In production, personal identifiers are masked for non-authorized roles.

---

## 📝 License
MIT License. Built for hackathon demonstration.
