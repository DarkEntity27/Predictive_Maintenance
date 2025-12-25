import joblib
import numpy as np
import os
import pandas as pd

class PredictionAgent:
    def __init__(self, model_path=None):
        """
        Loads the trained Random Forest model.
        """

        # Default path: backend/models/rf_fault_predictor.pkl
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(__file__))
            model_path = os.path.join(
                base_dir, "models", "rf_fault_predictor.pkl"
            )

        self.model = joblib.load(model_path)

    def predict(self, features):
        """
        Predict fault type and confidence.

        Parameters:
        features (list or array):
        [wear_level, alignment_deviation, vibration_index,
         environment_factor, load_cycles]

        Returns:
        fault_label (str)
        confidence (float)
        """

        feature_names = [
            "wear_level",
            "alignment_deviation",
            "vibration_index",
            "environment_factor",
            "load_cycles"
        ]

        X = pd.DataFrame([features], columns=feature_names)

        fault_label = self.model.predict(X)[0]
        confidence = float(self.model.predict_proba(X).max())

        return fault_label, round(confidence, 3)
