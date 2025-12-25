import json
import os
from datetime import datetime


def export_results_to_json(results, output_dir="outputs"):
    """
    Exports batch assessment results to a JSON file.

    Parameters:
    - results: list of dicts (batch output)
    - output_dir: directory to save JSON
    """

    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(
        output_dir, f"maintenance_results_{timestamp}.json"
    )

    with open(file_path, "w") as f:
        json.dump(results, f, indent=4)

    return file_path
