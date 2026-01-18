import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class LLMService:
    def __init__(self):
        # Access keys using os.getenv
        self.openai_key = os.getenv('OPENAI_API_KEY')
        
        # Initialize client if key exists, otherwise use fallback mode
        if self.openai_key and self.openai_key != 'your-openai-api-key-here':
            self.client = OpenAI(api_key=self.openai_key)
            self.use_fallback = False
        else:
            self.client = None
            self.use_fallback = True
            print("WARNING: OpenAI API key not configured. Using fallback summaries.")

    def generate_network_summary(self, context: dict) -> str:
        """
        Uses an LLM to generate a human-readable 
        network-level maintenance summary.
        """
        # Fallback mode: Generate simple summary without OpenAI
        if self.use_fallback:
            return self._generate_fallback_summary(context)
        
        prompt = f"""You are a professional Infrastructure Maintenance Expert. Generate a detailed, well-formatted maintenance summary report.

Network Assessment Data:
- Total segments evaluated: {context['total_segments']}
- Fault distribution: {context['fault_distribution']}
- High priority segments: {context['high_priority_segments']}
- Healthy segments: {context['total_segments'] - len(context['high_priority_segments'])}

Create a PROFESSIONAL MAINTENANCE REPORT with this EXACT structure:

## 1. Overall Infrastructure Health

[Provide comprehensive assessment of network health status, segment evaluation count, priority distribution, and general condition summary. 3-4 sentences.]

## 2. Dominant Fault Patterns

[Identify primary faults, explain what they indicate, list 2-3 underlying causes. Discuss systemic issues and trends. 4-5 sentences.]

## 3. Maintenance Urgency & Recommended Actions

### Immediate Actions (0-3 months)
- [Action 1: specific inspection or repair task]
- [Action 2: specific monitoring or assessment]

### Short-Term Actions (3-6 months)
- [Action 1: maintenance planning]
- [Action 2: resource allocation]

### Long-Term Actions (6-12 months)
- [Action 1: infrastructure improvements]
- [Action 2: preventive measures]

IMPORTANT FORMATTING:
- Use markdown formatting (##, ###, -, **bold**)
- Be specific and actionable
- Include timelines
- Provide professional recommendations
- Do NOT mention machine learning or models"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional railway infrastructure maintenance expert who generates detailed, well-formatted assessment reports with specific recommendations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def _generate_fallback_summary(self, context: dict) -> str:
        """Generate a well-formatted summary without using OpenAI API"""
        total = context['total_segments']
        faults = context['fault_distribution']
        high_priority = context['high_priority_segments']
        
        # Find dominant fault
        dominant_fault = max(faults.items(), key=lambda x: x[1])[0] if faults else 'None'
        
        # Determine health level
        if len(high_priority) >= total * 0.5:
            health = 'critical'
        elif len(high_priority) >= total * 0.3:
            health = 'moderate'
        else:
            health = 'good'
        
        # Build formatted summary
        summary = f"""**1. Overall Infrastructure Health**
The current assessment indicates a {health.upper()} level of infrastructure health across the railway track network. Out of {total} total segments evaluated, {len(high_priority)} segments have been classified as high priority requiring immediate attention.

**2. Dominant Fault Patterns**
The predominant fault pattern identified in the network is {dominant_fault.replace('_', ' ')}. This fault type accounts for a significant portion of the degradation observed and suggests {("immediate intervention is required to prevent catastrophic failure" if len(high_priority) >= total * 0.5 else "preventive maintenance should be prioritized to halt progression")}. This pattern indicates progressive infrastructure degradation that requires urgent corrective action.

**3. Maintenance Urgency & Recommended Actions**
{f"CRITICAL: {len(high_priority)} segments require immediate maintenance action." if len(high_priority) >= total * 0.5 else f"MODERATE: {len(high_priority)} segments require near-term maintenance scheduling."} It is recommended to:
- Prioritize inspection of the {len(high_priority)} flagged segments within the next 24-48 hours
- Allocate maintenance teams to address the most critical faults first
- Implement preventive measures across the remaining {total - len(high_priority)} segments
- Schedule follow-up assessments after corrective actions are completed"""
        
        return summary

    def generate_apu_explanation(self, context: dict) -> dict:
        """
        Generate detailed APU maintenance explanation using LLM.
        
        context: {
            "rul_hours": float,
            "severity": int (1-3),
            "confidence": float (0-1),
            "priority": int (1-3),
            "car_id": int,
            "fault": str
        }
        """
        if self.use_fallback:
            return self._generate_apu_fallback_explanation(context)
        
        rul_hours = context.get('rul_hours', 0)
        severity = context.get('severity', 1)
        confidence = context.get('confidence', 0.5)
        priority = context.get('priority', 1)
        car_id = context.get('car_id', 1)
        fault = context.get('fault', 'UNKNOWN')
        
        severity_text = {1: 'Normal', 2: 'Warning', 3: 'Critical'}[severity]
        
        prompt = f"""You are a specialized Metro APU (Air Production Unit) maintenance expert. Generate a PROFESSIONAL APU DIAGNOSTIC REPORT.

Diagnostic Data for Metro Car {car_id}:
- Remaining Useful Life (RUL): {rul_hours:.2f} hours
- System Severity: {severity_text}
- Prediction Confidence: {confidence*100:.1f}%
- Priority Level: {priority}/3
- Detected Condition: {fault.replace('_', ' ')}

Generate a detailed report with this EXACT structure:

## APU System Status

[Provide overall assessment of the APU system health. State RUL, severity level, and immediate operational impact. 2-3 sentences.]

## Key Performance Indicators

**Critical Metrics Affecting Degradation:**
- [Specific indicator 1 with impact description]
- [Specific indicator 2 with impact description]
- [Specific indicator 3 with impact description]
- [Specific indicator 4 with impact description]

## Maintenance Recommendations

### Immediate Actions (Next 24-48 hours)
- [Action 1: specific diagnostic or repair]
- [Action 2: operational restriction or monitoring]

### Short-Term Actions (1-2 weeks)
- [Action 1: preventive service]
- [Action 2: component inspection]

### Long-Term Actions (1-3 months)
- [Action 1: major service or replacement]
- [Action 2: continuous monitoring plan]

### Safety Considerations
[Brief note on operational safety and restrictions if applicable]

IMPORTANT:
- Use markdown formatting (##, ###, -, **bold**)
- Be specific and technical
- Include actionable steps
- Focus on preventing system failure
- Do NOT mention machine learning models"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional metro APU maintenance expert who generates detailed diagnostic reports with specific, actionable recommendations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            full_response = response.choices[0].message.content.strip()
            
            # Return the full formatted report as explanation
            # Extract first line as summary, keep full report as explanation
            lines = full_response.split('\n')
            first_content = next((line.strip() for line in lines if line.strip() and not line.startswith('#')), "APU Diagnostic Report Generated")
            
            sections = {
                "summary": first_content,
                "key_factors": "Detailed diagnostic report generated",
                "explanation": full_response  # Return full markdown formatted report
            }
            
            return sections
            
        except Exception as e:
            print(f"Error generating APU explanation: {str(e)}")
            return self._generate_apu_fallback_explanation(context)
    
    def _generate_apu_fallback_explanation(self, context: dict) -> dict:
        """Generate a detailed fallback explanation without OpenAI"""
        rul_hours = context.get('rul_hours', 0)
        severity = context.get('severity', 1)
        confidence = context.get('confidence', 0.5)
        priority = context.get('priority', 1)
        car_id = context.get('car_id', 1)
        
        severity_map = {
            1: ("Normal Operation", "Continue standard operational monitoring", "System is functioning within normal parameters"),
            2: ("Degradation Warning", "Oil temperature, pressure gradients, and motor current showing elevated stress patterns", "Schedule preventive maintenance within 60-90 days. Monitor system closely for accelerated degradation. Service compressor unit and check cooling systems."),
            3: ("Critical Failure Risk", "Multiple sensor anomalies indicating imminent system failure - high oil temperature, unstable pressure, excessive motor current draw", "IMMEDIATE ACTION REQUIRED. Isolate APU from service immediately. Full system inspection and component replacement necessary within 24-48 hours. Do not operate car in revenue service until repairs completed.")
        }
        
        status, factors, action = severity_map.get(severity, severity_map[1])
        
        return {
            "summary": f"Metro Car {car_id} APU assessment: {rul_hours:.1f} hours RUL with {confidence*100:.0f}% confidence. Status: {status}.",
            "key_factors": factors,
            "explanation": f"{action} Priority level: {priority}/3. Based on comprehensive sensor analysis and predictive modeling."
        }

# Example Usage:
# service = LLMService()
# print(service.generate_network_summary({...}))
# print(service.generate_apu_explanation({...}))
