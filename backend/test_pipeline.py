# from services.maintenance_service import MaintenanceService

# service = MaintenanceService()

# sample_features = [0.55, 5.1, 70.2, 1.02, 800]

# feature_importance = {
#     "wear_level": 0.45,
#     "vibration_index": 0.37,
#     "alignment_deviation": 0.17,
#     "load_cycles": 0.005,
#     "environment_factor": 0.004
# }

# result = service.assess_segment(sample_features, feature_importance)

# print(result)


# ------------- BATCH TEST ------------
from services.maintenance_service import MaintenanceService
from services.json_exporter import export_results_to_json

service = MaintenanceService()

segments = [
    {"segment_id": 1, "features": [0.32, 1.8, 28.5, 1.01, 420]},
    {"segment_id": 2, "features": [0.48, 3.9, 52.2, 0.97, 610]},
    {"segment_id": 3, "features": [0.71, 6.4, 78.1, 1.08, 890]},
]

feature_importance = {
    "wear_level": 0.45,
    "vibration_index": 0.37,
    "alignment_deviation": 0.17,
    "load_cycles": 0.005,
    "environment_factor": 0.004
}

results = service.assess_segments_batch(
    segments,
    feature_importance
)

json_path = export_results_to_json(results)

print(f"Batch results exported to: {json_path}")
