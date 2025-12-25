class ExplanationAgent:
    def explain(self, fault, confidence, feature_importance):
        top_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )[:2]

        reasons = ", ".join([f[0].replace("_", " ") for f in top_features])

        return {
            "summary": f"The system predicts {fault} with confidence {confidence}.",
            "key_factors": reasons,
            "explanation": (
                f"The decision is primarily influenced by {reasons}, "
                f"which indicate progressive infrastructure degradation."
            )
        }