import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("railway_track_simulated_dataset_final.csv")
print(df.head())
print(df.info())
plt.figure(figsize=(7,5))
sns.countplot(x="fault_label", data=df,
              order=["Normal","Surface_Crack","Misalignment","Severe_Degradation"])
plt.title("Fault Label Distribution")
plt.xlabel("Fault Type")
plt.ylabel("Count")
plt.show()
sample_segment = df[df["segment_id"] == 1]

plt.figure(figsize=(7,5))
plt.plot(sample_segment["time_step"], sample_segment["wear_level"])
plt.title("Wear Progression Over Time (Segment 1)")
plt.xlabel("Time Step")
plt.ylabel("Wear Level")
plt.show()
plt.figure(figsize=(7,5))
sns.scatterplot(
    x="wear_level",
    y="vibration_index",
    hue="fault_label",
    data=df,
    alpha=0.4
)
plt.title("Wear vs Vibration Colored by Fault Type")
plt.show()
plt.figure(figsize=(7,5))
sns.boxplot(
    x="fault_label",
    y="alignment_deviation",
    data=df,
    order=["Normal","Surface_Crack","Misalignment","Severe_Degradation"]
)
plt.title("Alignment Deviation Across Fault Types")
plt.show()
plt.figure(figsize=(7,5))
sns.boxplot(
    x="fault_label",
    y="risk_score",
    data=df,
    order=["Normal","Surface_Crack","Misalignment","Severe_Degradation"]
)
plt.title("Risk Score Distribution by Fault Type")
plt.show()
