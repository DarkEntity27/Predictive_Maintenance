import os
import json
import urllib.request
import urllib.parse

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHERMAP_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"

        # Mock segment coordinates for demo mapping
        # Maps segment_id to roughly (lat, lon) in Mumbai
        self.segment_coords = {
            1: (19.0760, 72.8777), # Mumbai
            2: (19.0822, 72.8812),
            3: (19.1136, 72.8697)
        }

    def get_weather_for_segment(self, segment_id):
        """
        Returns weather condition (e.g., 'Heavy Rain', 'Clear', 'Clouds').
        """
        # If no API key, use mock logic to simulate monsoon stress
        if not self.api_key:
            return self._mock_weather(segment_id)
        
        # Real API call
        coords = self.segment_coords.get(segment_id, (19.0760, 72.8777))
        params = {
            "lat": coords[0],
            "lon": coords[1],
            "appid": self.api_key,
            "units": "metric"
        }
        
        query_string = urllib.parse.urlencode(params)
        url = f"{self.base_url}?{query_string}"
        
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    # Check for rain
                    weather_main = data["weather"][0]["main"]
                    if "rain" in weather_main.lower() or "storm" in weather_main.lower():
                        return "Heavy Rain"
                    return weather_main
                else:
                    return self._mock_weather(segment_id)
        except Exception:
            return self._mock_weather(segment_id)

    def _mock_weather(self, segment_id):
        # Simulate heavy rain for specific segments to demonstrate the feature
        # For Mumbai monsoon demo, make it rainy for even segments or segment 2
        if segment_id % 2 == 0:
            return "Heavy Rain"
        return "Clear"
