"""
ML predictor: loads the trained model and exposes a predict() function.
This script relies solely on the trained XGBoost model for predictions.
"""

import pickle
from pathlib import Path
from typing import Tuple

import pandas as pd
import xgboost as xgb

_MODEL_PATH = Path(__file__).parent / "model.pkl"
_model = None

# LabelEncoder sorts labels alphabetically during training:
# 0: 'High', 1: 'Low', 2: 'Medium'
RISK_NAMES = ["High", "Low", "Medium"]


def _load_model():
    global _model
    if _model is None:
        if not _MODEL_PATH.exists():
            raise FileNotFoundError(f"ML model not found at {_MODEL_PATH}.")
        with open(_MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model


def predict(
    age_group: str,
    gender: str,
    answers: dict,
) -> Tuple[str, float]:
    """
    Predict the ASD risk level for a set of questionnaire answers
    using the trained XGBoost model.

    Parameters
    ----------
    age_group : '12-18' | '19-24' | '25-30' | '31-36'
    gender    : 'ذكر' | 'أنثى'
    answers   : dict mapping skill key → 0|1  (10 skills)

    Returns
    -------
    (risk_label, confidence)
      risk_label  : 'Low' | 'Medium' | 'High'
      confidence  : float in [0, 1] – max class probability
    """
    model = _load_model()

    # 1. Map Gender (0 for Female, 1 for Male based on your training data)
    gender_enc = 1 if gender == "ذكر" else 0

    # 2. Construct the exact feature dictionary expected by the XGBoost model
    feature_dict = {
        "Age_12–18 Months": [1 if age_group == "12-18" else 0],
        "Age_19–24 Months": [1 if age_group == "19-24" else 0],
        "Age_25–30 Months": [1 if age_group == "25-30" else 0],
        "Age_31–36 Months": [1 if age_group == "31-36" else 0],
        "Gender": [gender_enc],
        "Response_to_Name": [int(answers.get("response_to_name", 0))],
        "Eye_Contact": [int(answers.get("eye_contact", 0))],
        "Social_Smile": [int(answers.get("social_smile", 0))],
        "Imitation": [int(answers.get("imitation", 0))],
        "Discrimination": [int(answers.get("discrimination", 0))],
        "Pointing_with_Finger": [int(answers.get("pointing_with_finger", 0))],
        "Facial_Expressions": [int(answers.get("facial_expressions", 0))],
        "Joint_Attention": [int(answers.get("joint_attention", 0))],
        "Play_Skills": [int(answers.get("play_skills", 0))],
        "Response_to_Commands": [int(answers.get("response_to_commands", 0))]
    }

    # 3. Convert to Pandas DataFrame
    features_df = pd.DataFrame(feature_dict)

    # 4. Make prediction
    label_idx = int(model.predict(features_df)[0])
    proba = model.predict_proba(features_df)[0]
    confidence = float(proba[label_idx])

    return RISK_NAMES[label_idx], confidence
