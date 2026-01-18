"""
Test script for the unified backend API
Tests both railway track and metro APU endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def test_health_check():
    """Test the health check endpoint"""
    print("\n1. Testing Health Check Endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_railway_batch():
    """Test railway track batch assessment endpoint"""
    print("\n2. Testing Railway Track Batch Assessment...")
    
    # Sample data for 2 railway segments
    payload = {
        "segments": [
            {
                "segment_id": 101,
                "features": [0.65, 0.42, 0.28, 150000, 0.75]  # wear_level, vibration, alignment, load_cycles, env_factor
            },
            {
                "segment_id": 102,
                "features": [0.85, 0.68, 0.45, 280000, 0.82]  # High fault risk
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/assess/batch", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_railway_network():
    """Test railway network assessment endpoint"""
    print("\n3. Testing Railway Network Assessment...")
    
    payload = {
        "segments": [
            {
                "segment_id": 101,
                "features": [0.65, 0.42, 0.28, 150000, 0.75]
            },
            {
                "segment_id": 102,
                "features": [0.85, 0.68, 0.45, 280000, 0.82]
            },
            {
                "segment_id": 103,
                "features": [0.45, 0.30, 0.15, 95000, 0.60]
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/assess/network", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_apu_prediction():
    """Test metro APU prediction endpoint"""
    print("\n4. Testing Metro APU Prediction...")
    
    # Generate sample sensor data (180 timesteps x 15 features)
    import numpy as np
    np.random.seed(42)
    
    # Simulate sensor readings that indicate deteriorating APU health
    sensor_window = []
    for i in range(180):
        # 15 sensor features with gradual deterioration
        timestep = [
            50 + i * 0.1,      # temperature (increasing)
            100 - i * 0.05,    # pressure (decreasing)  
            3000 + i * 10,     # rpm
            45 + i * 0.08,     # vibration (increasing)
            75 - i * 0.02,     # efficiency (decreasing)
            # Additional 10 features
            *np.random.randn(10).tolist()
        ]
        sensor_window.append(timestep)
    
    payload = {
        "sensor_window": sensor_window,
        "car_id": 2501
    }
    
    response = requests.post(f"{BASE_URL}/predict/apu", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")
    return response.status_code == 200

def run_all_tests():
    """Run all endpoint tests"""
    print("=" * 60)
    print("UNIFIED BACKEND API TESTING")
    print("=" * 60)
    
    results = {
        "Health Check": test_health_check(),
        "Railway Batch Assessment": test_railway_batch(),
        "Railway Network Assessment": test_railway_network(),
        "Metro APU Prediction": test_apu_prediction()
    }
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("=" * 60))
    if all_passed:
        print("✓ ALL TESTS PASSED!")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to the backend server.")
        print("Please make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
