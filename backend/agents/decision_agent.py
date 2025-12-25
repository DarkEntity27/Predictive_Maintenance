class DecisionAgent:
    """
    Converts predicted fault labels into
    maintenance priority and recommended action.
    """

    def __init__(self):
        self.priority_map = {
            "Normal": 1,
            "Surface_Crack": 2,
            "Misalignment": 3,
            "Severe_Degradation": 4
        }

        self.action_map = {
            "Normal": "Continue routine monitoring",
            "Surface_Crack": "Schedule preventive maintenance",
            "Misalignment": "Prioritize corrective maintenance",
            "Severe_Degradation": "Immediate maintenance required"
        }

    def decide(self, fault_label):
        """
        Given a fault label, return maintenance decision.

        Returns:
        {
            "priority": int,
            "action": str
        }
        """

        return {
            "priority": self.priority_map.get(fault_label, 0),
            "action": self.action_map.get(
                fault_label, "No action defined"
            )
        }
