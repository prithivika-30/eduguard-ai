import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

MODEL_FILE = os.path.join(ARTIFACT_DIR, "active_model.joblib")
META_FILE = os.path.join(ARTIFACT_DIR, "model_metadata.json")

FEATURE_COLUMNS = [
    "attendance_rate",
    "average_score",
    "recent_exam_score",
    "assignment_completion",
    "engagement_score",
    "previous_failures"
]

STAGE_MAPPING = {
    "School": 1,
    "Higher Secondary": 2,
    "Undergraduate": 3,
    "Other": 4
}

# Population statistics used for relative factor contribution analysis
BENCHMARKS = {
    "attendance_rate": {"mean": 82.5, "std": 12.0, "threshold_warn": 75.0, "name": "Attendance Rate", "unit": "%"},
    "average_score": {"mean": 74.0, "std": 14.0, "threshold_warn": 60.0, "name": "Average Cumulative Score", "unit": "%"},
    "recent_exam_score": {"mean": 71.5, "std": 16.0, "threshold_warn": 55.0, "name": "Recent Exam Score", "unit": "%"},
    "assignment_completion": {"mean": 85.0, "std": 15.0, "threshold_warn": 70.0, "name": "Assignment Completion", "unit": "%"},
    "engagement_score": {"mean": 68.0, "std": 20.0, "threshold_warn": 50.0, "name": "LMS & Activity Engagement", "unit": "/100"},
    "previous_failures": {"mean": 0.3, "std": 0.8, "threshold_warn": 1.0, "name": "Historical Course Backlogs", "unit": " courses"}
}

def generate_synthetic_training_dataset(n_samples: int = 1000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic training dataset reflecting real academic research:
    Low attendance, low exam scores, low engagement, and previous failures strongly associate with dropout risk.
    """
    np.random.seed(random_seed)
    
    stages = np.random.choice(["School", "Higher Secondary", "Undergraduate", "Other"], size=n_samples, p=[0.25, 0.25, 0.45, 0.05])
    
    # Latent student academic health factor
    health = np.random.normal(loc=0.0, scale=1.0, size=n_samples)
    
    attendance = np.clip(82.0 + 12.0 * health + np.random.normal(0, 4, n_samples), 35.0, 100.0)
    avg_score = np.clip(73.0 + 14.0 * health + np.random.normal(0, 5, n_samples), 30.0, 100.0)
    recent_exam = np.clip(70.0 + 16.0 * health + np.random.normal(0, 6, n_samples), 25.0, 100.0)
    assignments = np.clip(84.0 + 13.0 * health + np.random.normal(0, 5, n_samples), 20.0, 100.0)
    engagement = np.clip(68.0 + 18.0 * health + np.random.normal(0, 7, n_samples), 15.0, 100.0)
    
    # Failures occur disproportionately when health is low
    failures_prob = np.clip(0.05 - 0.25 * health, 0.0, 0.9)
    previous_failures = np.random.binomial(n=3, p=failures_prob)

    # Ground truth dropout probability calculation
    logit = (
        -0.08 * (attendance - 75.0)
        -0.05 * (avg_score - 60.0)
        -0.06 * (recent_exam - 55.0)
        -0.04 * (assignments - 70.0)
        -0.03 * (engagement - 50.0)
        + 0.85 * previous_failures
        - 1.6 # baseline intercept
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    labels = (np.random.uniform(0, 1, size=n_samples) < prob).astype(int)

    df = pd.DataFrame({
        "stage": stages,
        "attendance_rate": np.round(attendance, 1),
        "average_score": np.round(avg_score, 1),
        "recent_exam_score": np.round(recent_exam, 1),
        "assignment_completion": np.round(assignments, 1),
        "engagement_score": np.round(engagement, 1),
        "previous_failures": previous_failures,
        "dropout_label": labels
    })
    return df

def train_and_evaluate_all_models(df: pd.DataFrame = None) -> Dict[str, Any]:
    """
    Trains 4 candidate models:
    - Logistic Regression
    - Decision Tree
    - Random Forest
    - Gradient Boosting
    Computes genuine test metrics, selects the best model, and persists artifacts.
    """
    if df is None:
        df = generate_synthetic_training_dataset(1200, random_seed=42)
    
    X = df[FEATURE_COLUMNS]
    y = df["dropout_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    candidates = {
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1.0

    for name, model in candidates.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
            roc_auc = float(roc_auc_score(y_test, y_prob))
        else:
            roc_auc = 0.5

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        # Extract real feature importances
        if hasattr(model, "feature_importances_"):
            importances = dict(zip(FEATURE_COLUMNS, [float(v) for v in model.feature_importances_]))
        elif hasattr(model, "coef_"):
            abs_coef = np.abs(model.coef_[0])
            total = np.sum(abs_coef) or 1.0
            importances = dict(zip(FEATURE_COLUMNS, [float(v / total) for v in abs_coef]))
        else:
            importances = {col: 1.0 / len(FEATURE_COLUMNS) for col in FEATURE_COLUMNS}

        results[name] = {
            "model_name": name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "feature_importances": importances,
            "trained_records": len(df),
            "model_obj": model
        }

        # Select model based on balanced F1 score
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    # Persist the best model
    best_meta = results[best_model_name]
    joblib.dump(best_meta["model_obj"], MODEL_FILE)

    save_meta = {
        "active_model_name": best_model_name,
        "version_tag": f"v1.0-{best_model_name.replace(' ', '')}",
        "dataset_records_count": len(df),
        "models": {k: {m: v for m, v in val.items() if m != "model_obj"} for k, val in results.items()}
    }
    with open(META_FILE, "w") as f:
        json.dump(save_meta, f, indent=2)

    return save_meta

def get_loaded_model():
    """Loads active model from disk or trains if not yet saved."""
    if not os.path.exists(MODEL_FILE):
        train_and_evaluate_all_models()
    return joblib.load(MODEL_FILE)

def calculate_explainability_factors(features: Dict[str, float], model=None) -> List[Dict[str, Any]]:
    """
    Computes explainable factor contributions based on feature values relative to benchmark thresholds
    and model feature importance.
    Uses rigorous, non-causal language: 'Factors associated with this model prediction'.
    """
    factors = []
    
    # Get model weights if available
    try:
        if model is None:
            model = get_loaded_model()
        if hasattr(model, "feature_importances_"):
            weights = dict(zip(FEATURE_COLUMNS, model.feature_importances_))
        elif hasattr(model, "coef_"):
            weights = dict(zip(FEATURE_COLUMNS, np.abs(model.coef_[0])))
        else:
            weights = {f: 1.0 / len(FEATURE_COLUMNS) for f in FEATURE_COLUMNS}
    except Exception:
        weights = {f: 1.0 / len(FEATURE_COLUMNS) for f in FEATURE_COLUMNS}

    for col in FEATURE_COLUMNS:
        val = float(features.get(col, 0.0))
        meta = BENCHMARKS[col]
        name = meta["name"]
        unit = meta["unit"]
        warn_th = meta["threshold_warn"]
        mean_val = meta["mean"]
        weight = float(weights.get(col, 0.15))

        if col == "previous_failures":
            if val >= 2:
                impact = "High Negative"
                desc = f"Student has {int(val)} historical course backlogs, which strongly elevates risk score."
                w = -0.45 * weight
            elif val == 1:
                impact = "Moderate Negative"
                desc = f"1 backlog recorded, moderately associated with elevated risk."
                w = -0.25 * weight
            else:
                impact = "Positive"
                desc = "No course backlogs; academic progression on schedule."
                w = 0.20 * weight
        else:
            diff_from_warn = val - warn_th
            diff_from_mean = val - mean_val

            if diff_from_warn < -10:
                impact = "High Negative"
                desc = f"{name} is critically low at {val}{unit} (institutional benchmark is {warn_th}{unit})."
                w = -0.40 * weight
            elif diff_from_warn < 0:
                impact = "Moderate Negative"
                desc = f"{name} ({val}{unit}) sits below warning threshold of {warn_th}{unit}."
                w = -0.22 * weight
            elif diff_from_mean > 5:
                impact = "Positive"
                desc = f"{name} ({val}{unit}) is above cohort average ({mean_val}{unit}), serving as a protective factor."
                w = 0.25 * weight
            else:
                impact = "Neutral"
                desc = f"{name} is at normal range ({val}{unit})."
                w = 0.05 * weight

        factors.append({
            "factor": name,
            "impact": impact,
            "weight": round(w, 3),
            "value": f"{val}{unit}" if unit != " courses" else str(int(val)),
            "description": desc
        })

    # Sort so most critical negative factors appear first, then positive
    impact_order = {"High Negative": 0, "Moderate Negative": 1, "Neutral": 2, "Positive": 3}
    factors.sort(key=lambda x: impact_order.get(x["impact"], 99))
    return factors

def predict_student_risk(features: Dict[str, float], high_threshold: float = 0.70, medium_threshold: float = 0.40) -> Dict[str, Any]:
    """
    Executes actual model prediction, computes probability score, risk band, confidence, and factors.
    """
    model = get_loaded_model()
    
    input_df = pd.DataFrame([{
        "attendance_rate": float(features.get("attendance_rate", 75.0)),
        "average_score": float(features.get("average_score", 70.0)),
        "recent_exam_score": float(features.get("recent_exam_score", 65.0)),
        "assignment_completion": float(features.get("assignment_completion", 80.0)),
        "engagement_score": float(features.get("engagement_score", 65.0)),
        "previous_failures": int(features.get("previous_failures", 0))
    }], columns=FEATURE_COLUMNS)

    prob = float(model.predict_proba(input_df)[0][1])

    if prob >= high_threshold:
        risk_level = "High"
    elif prob >= medium_threshold:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Confidence score: higher when data is further away from borderline decisions
    distance_to_boundary = min(abs(prob - high_threshold), abs(prob - medium_threshold))
    confidence = float(np.clip(0.70 + 0.5 * distance_to_boundary, 0.70, 0.96))

    factors = calculate_explainability_factors(features, model=model)

    version_tag = "v1.0-ActiveEnsemble"
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r") as f:
                meta = json.load(f)
                version_tag = meta.get("version_tag", version_tag)
        except Exception:
            pass

    return {
        "risk_score": round(prob, 4),
        "risk_level": risk_level,
        "confidence_score": round(confidence, 3),
        "model_version": version_tag,
        "contributing_factors": factors
    }

def run_what_if_simulation(
    baseline_features: Dict[str, float],
    simulated_features: Dict[str, float],
    high_threshold: float = 0.70,
    medium_threshold: float = 0.40
) -> Dict[str, Any]:
    """
    Simulates model probability response to educator-adjusted indicators.
    Labels clearly as scenario estimate without claiming causal guarantee.
    """
    baseline_pred = predict_student_risk(baseline_features, high_threshold, medium_threshold)
    simulated_pred = predict_student_risk(simulated_features, high_threshold, medium_threshold)

    diff = round(simulated_pred["risk_score"] - baseline_pred["risk_score"], 4)

    comparison = []
    for col in FEATURE_COLUMNS:
        b_val = float(baseline_features.get(col, 0.0))
        s_val = float(simulated_features.get(col, 0.0))
        comparison.append({
            "metric": BENCHMARKS[col]["name"],
            "baseline": round(b_val, 1),
            "simulated": round(s_val, 1),
            "diff": round(s_val - b_val, 1)
        })

    return {
        "baseline_risk_level": baseline_pred["risk_level"],
        "baseline_risk_score": baseline_pred["risk_score"],
        "simulated_risk_level": simulated_pred["risk_level"],
        "simulated_risk_score": simulated_pred["risk_score"],
        "risk_difference": diff,
        "changed_factors": simulated_pred["contributing_factors"],
        "comparison": comparison,
        "model_version": baseline_pred["model_version"],
        "disclaimer": "Scenario estimate — not a guarantee of outcome. EduGuard AI provides decision-support signals and does not establish causality."
    }
