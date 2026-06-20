from ..services.weather_service import WeatherService

class SummaryAgent:
    def __init__(self):
        self.weather_service = WeatherService()

    def build_context(self, batch_results):
        total = len(batch_results)

        fault_counts = {}
        high_priority = []
        weather_alerts = 0

        for r in batch_results:
            # Check Weather API
            weather = self.weather_service.get_weather_for_segment(r["segment_id"])
            r["weather_condition"] = weather
            
            # features: [wear_level, alignment_deviation, vibration_index, environment_factor, load_cycles]
            if "features" in r:
                alignment_deviation = r["features"][1]
                
                # Apply Weather Stress Factor
                if weather == "Heavy Rain" and alignment_deviation > 30.0:
                    old_priority = r["priority"]
                    # Boost priority up to maximum 5
                    new_priority = min(5, old_priority + 1)
                    if new_priority > old_priority:
                        r["priority"] = new_priority
                        r["fault"] = f"{r['fault']} (+WEATHER_STRESS)"
                        r["explanation"] += (
                            f" [WEATHER ALERT: {weather} detected at segment {r['segment_id']}. "
                            f"High alignment deviation ({alignment_deviation}) makes soil shifting likely. "
                            f"Priority escalated from {old_priority} to {new_priority}.]"
                        )
                    weather_alerts += 1

            fault = r["fault"]
            fault_counts[fault] = fault_counts.get(fault, 0) + 1

            if r["priority"] >= 3:
                if r["segment_id"] not in high_priority:
                    high_priority.append(r["segment_id"])

        return {
            "total_segments": total,
            "fault_distribution": fault_counts,
            "high_priority_segments": high_priority,
            "weather_stress_alerts": weather_alerts
        }
