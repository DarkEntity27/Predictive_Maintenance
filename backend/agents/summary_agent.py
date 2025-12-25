class SummaryAgent:
    def build_context(self, batch_results):
        total = len(batch_results)

        fault_counts = {}
        high_priority = []

        for r in batch_results:
            fault = r["fault"]
            fault_counts[fault] = fault_counts.get(fault, 0) + 1

            if r["priority"] >= 3:
                high_priority.append(r["segment_id"])

        return {
            "total_segments": total,
            "fault_distribution": fault_counts,
            "high_priority_segments": high_priority
        }
