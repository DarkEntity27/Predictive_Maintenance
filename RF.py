import pandas as pd

df = pd.read_csv("railway_track_simulated_dataset_final.csv")

features = [
    "wear_level",
    "alignment_deviation",
    "vibration_index",
    "environment_factor",
    "load_cycles"
]

X = df[features]
y = df["fault_label"]

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

from sklearn.ensemble import RandomForestClassifier

class_weights = {
    "Normal": 1.0,
    "Surface_Crack": 2.5,
    "Misalignment": 1.5,
    "Severe_Degradation": 0.7
}

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    class_weight=class_weights,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
import joblib

joblib.dump(model, "railway_fault_rf_model.pkl")
print("Model saved successfully!")


from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))
cm = confusion_matrix(y_test, y_pred, labels=model.classes_)

plt.figure(figsize=(7,5))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    xticklabels=model.classes_,
    yticklabels=model.classes_,
    cmap="Blues"
)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()
importances = model.feature_importances_

feature_importance_df = pd.DataFrame({
    "Feature": features,
    "Importance": importances
}).sort_values(by="Importance", ascending=False)

print(feature_importance_df)
