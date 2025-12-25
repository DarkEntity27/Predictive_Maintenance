import random
import pandas as pd
import numpy as np

# -----------------------------
# Configuration
# -----------------------------
NUM_SEGMENTS = 10
TIME_STEPS = 3000
ALPHA = 0.00001
BETA = 0.15

data = []

# -----------------------------
# Fault labeling logic
# -----------------------------
def assign_fault_label(wear, alignment, vibration, t, severe_counter):
    if severe_counter > 100 and t > 2000:
        return "Severe_Degradation"
    elif alignment >= 5:
        return "Misalignment"
    elif wear >= 0.30:
        return "Surface_Crack"
    else:
        return "Normal"

# -----------------------------
# Simulation Loop
# -----------------------------
for segment_id in range(1, NUM_SEGMENTS + 1):

    wear = random.uniform(0.05, 0.15)
    alignment = random.uniform(0.1, 0.5)

    high_risk_segment = random.random() < 0.05  # 10% risky segments
    severe_counter = 0
    INSPECTION_INTERVAL = 50  # sample every 50 timesteps



    for t in range(TIME_STEPS):

        load_cycles = random.randint(100, 1000)
        environment_factor = round(random.uniform(0.8, 1.2), 2)

        if random.random() < 0.15:
            degradation_rate = round(random.uniform(0.08, 0.15), 3)
        else:
            degradation_rate = round(random.uniform(0.01, 0.08), 3)

        # -----------------------------
        # Wear evolution
        # -----------------------------
        wear += ALPHA * load_cycles * degradation_rate * environment_factor

        # Rare episodic stress (segment-level risk)
        if high_risk_segment and random.random() < 0.01:
            wear += random.uniform(0.02, 0.04)

        wear = min(max(wear, 0), 0.9)

        # -----------------------------
        # Alignment evolution
        # -----------------------------
        noise = np.random.normal(0, 0.2)
        if wear > 0.4:
            alignment += BETA * wear + noise
        else:
            alignment += noise * 0.1

        alignment = min(max(alignment, 0), 10)

        # -----------------------------
        # Vibration index
        # -----------------------------
        vibration = 100 * (0.6 * wear + 0.4 * (alignment / 10))
        vibration = min(max(vibration, 0), 100)

        # -----------------------------
        # Severe persistence logic
        # -----------------------------
        if wear >= 0.65 and vibration >= 65:
            severe_counter += 1
        else:
            severe_counter = max(severe_counter - 1, 0)

        # -----------------------------
        # Risk score
        # -----------------------------
        risk_score = (
            0.4 * wear +
            0.3 * (alignment / 10) +
            0.3 * (vibration / 100)
        )
        fault_label = assign_fault_label(
            wear, alignment, vibration, t, severe_counter
        )
        # if t % INSPECTION_INTERVAL != 0:
        #     continue

        data.append([
            segment_id,
            t,
            load_cycles,
            round(wear, 3),
            round(alignment, 2),
            round(vibration, 1),
            environment_factor,
            degradation_rate,
            round(risk_score, 3),
            fault_label
        ])

# -----------------------------
# Save Dataset
# -----------------------------
columns = [
    "segment_id",
    "time_step",
    "load_cycles",
    "wear_level",
    "alignment_deviation",
    "vibration_index",
    "environment_factor",
    "degradation_rate",
    "risk_score",
    "fault_label"
]

df = pd.DataFrame(data, columns=columns)
df.to_csv("railway_track_simulated_dataset_final.csv", index=False)

print("Dataset generated successfully!")
print(df.head())
print(df['fault_label'].value_counts(normalize=True))
