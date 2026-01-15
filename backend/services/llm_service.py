import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
# It's good practice to call this once at the top of your main entry point

load_dotenv()
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
        
        prompt = f"""
        You are an infrastructure maintenance expert.
        
        Given the following network assessment data:
        - Total segments: {context['total_segments']}
        - Fault distribution: {context['fault_distribution']}
        - High priority segments: {context['high_priority_segments']}
        
        Write a concise, professional summary that includes:
        1. Overall infrastructure health
        2. Dominant fault patterns
        3. Maintenance urgency and recommended actions
        
        Do NOT mention machine learning models.
        Do NOT speculate beyond the given data.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You generate maintenance decision summaries."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def _generate_fallback_summary(self, context: dict) -> str:
        """Generate a simple summary without using OpenAI API"""
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
        
        summary = f"""MAINTENANCE DECISION SUMMARY

1. Overall Infrastructure Health: The current assessment indicates a {health} level of infrastructure health, with a total of {total} segments evaluated.

2. Dominant Fault Patterns: The predominant fault patterns identified include {dominant_fault.replace('_', ' ')}. This suggests that {"immediate attention is required" if len(high_priority) > 0 else "preventive maintenance should be scheduled"}.

3. Maintenance Urgency and Recommended Actions: Given that {len(high_priority)} segments are classified as high priority, {"immediate action is warranted. It is recommended to conduct thorough inspection and repair to address the identified faults" if len(high_priority) > 0 else "standard maintenance schedules should be maintained with periodic monitoring"}."""
        
        return summary

# Example Usage:
# service = LLMService()
# print(service.generate_network_summary({...}))
