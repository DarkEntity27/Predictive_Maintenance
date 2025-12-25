import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import xgboost as xgb

# Load dataset
df = pd.read_csv("railway_track_simulated_dataset_final.csv")

# Split into X and y
X = df.drop("fault_label", axis=1)
y = df["fault_label"]

# Encode labels
le = LabelEncoder()
y = le.fit_transform(y)

# Train–test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Convert to DMatrix format
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

# XGBoost parameters
params = {
    'max_depth': 4,
    'eta': 0.05,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'objective': 'multi:softmax',
    'num_class': len(le.classes_),
    'eval_metric': 'mlogloss'
}

# Train with early stopping
model = xgb.train(
    params=params,
    dtrain=dtrain,
    num_boost_round=300,
    evals=[(dtrain, "train"), (dtest, "test")],
    early_stopping_rounds=20,
    verbose_eval=True
)

# Predict + evaluate
y_pred = model.predict(dtest)
acc = accuracy_score(y_test, y_pred)
model.save_model("railway_fault_xgb_model.json")
print("XGBoost model saved!")
import joblib

joblib.dump(le, "railway_fault_label_encoder.pkl")
print("LabelEncoder saved!")

print("\nModel accuracy:", round(acc * 100, 2), "%")
print("Best iteration:", model.best_iteration)