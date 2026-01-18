from ..agents.prediction_agent import PredictionAgent
from ..agents.decision_agent import DecisionAgent
from ..agents.explanation_agent import ExplanationAgent
from ..agents.summary_agent import SummaryAgent
from ..services.llm_service import LLMService
from ..services.notification_service import NotificationService

class MaintenanceService:
    def __init__(self):
        self.predictor = PredictionAgent()
        self.decision = DecisionAgent()
        self.explainer = ExplanationAgent()
        self.summary_agent = SummaryAgent()
        self.llm = LLMService()
        self.notifier = NotificationService()

    def assess_segment(self, features, feature_importance,segment_id=None):
        fault, confidence = self.predictor.predict(features)
        decision = self.decision.decide(fault)
        explanation = self.explainer.explain(
            fault, confidence, feature_importance
        )
        print("FAULT:", fault, "PRIORITY:", decision["priority"])
        if fault == "Severe_Degradation" or decision["priority"] >= 3:
            if segment_id is not None:
                self.notifier.send_alert(
                    segment_id=segment_id,
                    fault=fault,
                    priority=decision["priority"],
                    confidence=confidence
                )
        return {
            "fault": fault,
            "confidence": confidence,
            "priority": decision["priority"],
            "action": decision["action"],
            "explanation": explanation
        }

    # ✅ NEW: batch assessment
    def assess_segments_batch(self, segments, feature_importance):
        """
        segments: list of dicts
        [
          {
            "segment_id": 1,
            "features": [...]
          },
          ...
        ]
        """

        results = []

        for segment in segments:
            result = self.assess_segment(
                segment["features"],
                feature_importance,
                segment_id=segment["segment_id"]
            )

            results.append({
                "segment_id": segment["segment_id"],
                **result
            })

        return results
    def assess_network(self, segments, feature_importance):
        """
        Full network-level assessment:
        - per-segment analysis
        - aggregated summary
        """

        segment_results = self.assess_segments_batch(
            segments,
            feature_importance
        )
        summary_context = self.summary_agent.build_context(segment_results)

        network_summary_text = self.llm.generate_network_summary(
            summary_context
        )

        return {
            "segments": segment_results,
            "network_summary": {
                "structured": summary_context,
                "narrative": network_summary_text
            }
        }

    def assess_apu(self, severity, confidence, car_id=None, rul_hours=None):
        """
        APU-specific assessment with OpenAI summaries and email alerts.
        
        severity: 1 (NORMAL), 2 (WARNING), 3 (CRITICAL)
        confidence: float between 0-1
        car_id: Metro car identifier
        rul_hours: Remaining useful life in hours
        """
        # Map APU severity to priority (compatible with decision agent)
        priority_map = {1: 1, 2: 2, 3: 3}
        priority = priority_map.get(severity, 1)
        
        # Create APU-specific fault label
        if severity == 3:
            fault = "APU_CRITICAL_FAILURE_RISK"
        elif severity == 2:
            fault = "APU_DEGRADATION_WARNING"
        else:
            fault = "APU_NORMAL_OPERATION"
        
        # Generate detailed explanation using LLM
        apu_context = {
            "rul_hours": rul_hours,
            "severity": severity,
            "confidence": confidence,
            "priority": priority,
            "car_id": car_id,
            "fault": fault
        }
        
        detailed_explanation = self.llm.generate_apu_explanation(apu_context)
        
        # Send alert if priority is high
        if priority >= 2:
            if car_id is not None:
                self.notifier.send_alert(
                    segment_id=car_id,
                    fault=fault,
                    priority=priority,
                    confidence=confidence
                )
        
        return {
            "fault": fault,
            "confidence": confidence,
            "priority": priority,
            "rul_hours": rul_hours,
            "explanation": detailed_explanation
        }
