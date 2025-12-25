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
        
        # Validation: Ensure the key exists before proceeding
        if not self.openai_key:
            raise RuntimeError("OPENAI_API_KEY is missing from your .env file.")

        # Initialize the client
        self.client = OpenAI(api_key=self.openai_key)

    def generate_network_summary(self, context: dict) -> str:
        """
        Uses an LLM to generate a human-readable 
        network-level maintenance summary.
        """
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

# Example Usage:
# service = LLMService()
# print(service.generate_network_summary({...}))