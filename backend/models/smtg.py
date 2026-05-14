import joblib
import matplotlib.pyplot as plt
import pandas as pd

# -------- LOAD MODEL (FIX) --------
model = joblib.load("rf_fault_predictor.pkl")

# -------- FEATURE NAMES --------
feature_names = [
    "Wear Level",
    "Alignment Deviation",
    "Vibration Index",
    "Temperature",
    "Load Cycles"
]

# -------- FEATURE IMPORTANCE --------
importances = model.feature_importances_

df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
}).sort_values(by="Importance", ascending=False)

# -------- PLOT --------
plt.figure(figsize=(6, 4))
plt.barh(df["Feature"], df["Importance"])
plt.gca().invert_yaxis()
plt.xlabel("Importance Score")
plt.title("Feature Importance Analysis (Random Forest)")
plt.tight_layout()

plt.savefig("feature_importance.png", dpi=300)
plt.show()

print("✅ feature_importance.png generated successfully")
