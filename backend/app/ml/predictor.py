import pickle
from pathlib import Path
from typing import Tuple

import pandas as pd

# Paths
_MODEL_PATH = Path(__file__).parent / "model.pkl"
_ENCODER_PATH = Path(__file__).parent / "label_encoder.pkl"
_FEATURES_PATH = Path(__file__).parent / "feature_names.pkl"

_model = None
_encoder = None
_feature_names = None


def _load_assets():
    global _model, _encoder, _feature_names

    if _model is None:
        with open(_MODEL_PATH, "rb") as f:
            _model = pickle.load(f)

    if _encoder is None:
        with open(_ENCODER_PATH, "rb") as f:
            _encoder = pickle.load(f)

    if _feature_names is None:
        with open(_FEATURES_PATH, "rb") as f:
            _feature_names = pickle.load(f)

    return _model, _encoder, _feature_names


def predict(
    age_group: str,
    gender: str,
    answers: dict,
) -> Tuple[str, float]:

    model, encoder, feature_names = _load_assets()

    # 1. Encode gender
    gender_enc = 1 if gender == "ذكر" else 0

    # 2. Build features (نفس اللي عندكم)
    feature_dict = {
        "Age_12–18 Months": 1 if age_group == "12-18" else 0,
        "Age_19–24 Months": 1 if age_group == "19-24" else 0,
        "Age_25–30 Months": 1 if age_group == "25-30" else 0,
        "Age_31–36 Months": 1 if age_group == "31-36" else 0,
        "Gender": gender_enc,
        "Response_to_Name": int(answers.get("response_to_name", 0)),
        "Eye_Contact": int(answers.get("eye_contact", 0)),
        "Social_Smile": int(answers.get("social_smile", 0)),
        "Imitation": int(answers.get("imitation", 0)),
        "Discrimination": int(answers.get("discrimination", 0)),
        "Pointing_with_Finger": int(answers.get("pointing_with_finger", 0)),
        "Facial_Expressions": int(answers.get("facial_expressions", 0)),
        "Joint_Attention": int(answers.get("joint_attention", 0)),
        "Play_Skills": int(answers.get("play_skills", 0)),
        "Response_to_Commands": int(answers.get("response_to_commands", 0)),
    }

    # 3. تحويل إلى DataFrame بنفس ترتيب التدريب
    features_df = pd.DataFrame([feature_dict])[feature_names]

    # 4. Prediction
    pred = model.predict(features_df)[0]
    proba = model.predict_proba(features_df)[0]

    # 5. تحويل النتيجة إلى Low/Medium/High
    label = encoder.inverse_transform([pred])[0]
    confidence = float(max(proba))

    return label, confidence
