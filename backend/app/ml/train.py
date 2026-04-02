"""
Train the ASD risk prediction model and save it as a .pkl file.

The model is an XGBoost classifier (multi:softprob objective) trained on
synthetic data that is generated from the existing rule-based classifyRisk()
function.  Once real user data has been collected via the
/api/questionnaire/submit endpoint the model can be retrained on actual
assessments to improve accuracy.

Run this script once before starting the server:
    python -m app.ml.train

The trained model is saved to: app/ml/model.pkl
"""

import os
import pickle
from pathlib import Path

import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# ---------------------------------------------------------------------------
# Risk classification – mirrors the front-end classifyRisk() function
# ---------------------------------------------------------------------------

AGE_GROUP_ENCODING = {"12-18": 1, "19-24": 2, "25-30": 3, "31-36": 4}
AGE_GROUPS = list(AGE_GROUP_ENCODING.keys())

RISK_LABELS = {"low": 0, "medium": 1, "high": 2}
RISK_NAMES = {0: "low", 1: "medium", 2: "high"}


def classify_risk_rule_based(age_group: str, score: int) -> str:
    """Python port of the JavaScript classifyRisk() function."""
    if age_group == "12-18":
        if score <= 2:
            return "low"
        if 3 <= score <= 5:
            return "medium"
        return "high"

    if age_group == "19-24":
        if score <= 2:
            return "low"
        if 3 <= score <= 4:
            return "medium"
        return "high"

    if age_group == "25-30":
        if score <= 1:
            return "low"
        if 2 <= score <= 4:
            return "medium"
        return "high"

    if age_group == "31-36":
        if score <= 1:
            return "low"
        if 2 <= score <= 3:
            return "medium"
        return "high"

    return "low"


# ---------------------------------------------------------------------------
# Synthetic data generation
# ---------------------------------------------------------------------------

def generate_training_data(noise_fraction: float = 0.05, random_state: int = 42) -> tuple:
    """
    Generate training samples from all possible feature combinations.

    Features (13 total):
      - age_group_enc : int in 1-4
      - gender_enc    : int in 0-1  (0 = ذكر, 1 = أنثى)
      - 10 skill answers : 0 or 1 each

    Target:
      - risk label: 0=low, 1=medium, 2=high
    """
    rng = np.random.default_rng(random_state)
    X, y = [], []

    for age_group in AGE_GROUPS:
        age_enc = AGE_GROUP_ENCODING[age_group]
        for gender_enc in (0, 1):
            # All 2^10 = 1024 combinations of skill answers
            for combo in range(1024):
                answers = [(combo >> i) & 1 for i in range(10)]
                score = sum(answers)
                risk = classify_risk_rule_based(age_group, score)
                X.append([age_enc, gender_enc] + answers)
                y.append(RISK_LABELS[risk])

    X = np.array(X, dtype=np.int8)
    y = np.array(y, dtype=np.int8)

    # Add a small amount of label noise to encourage the model to learn
    # generalizable patterns rather than just memorising the rules.
    n_flip = int(len(y) * noise_fraction)
    flip_idx = rng.choice(len(y), size=n_flip, replace=False)
    y[flip_idx] = rng.integers(0, 3, size=n_flip)

    return X, y


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_and_save(model_path: Path | None = None) -> None:
    if model_path is None:
        model_path = Path(__file__).parent / "model.pkl"

    print("Generating synthetic training data …")
    X, y = generate_training_data()
    print(f"  {len(X)} samples, {X.shape[1]} features, {len(set(y))} classes")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training XGBoost classifier …")
    clf = XGBClassifier(
        objective="multi:softprob",
        num_class=3,
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    print("Evaluation on held-out test set:")
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["low", "medium", "high"]))

    model_path.parent.mkdir(parents=True, exist_ok=True)
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    print(f"Model saved to: {model_path}")


if __name__ == "__main__":
    train_and_save()
