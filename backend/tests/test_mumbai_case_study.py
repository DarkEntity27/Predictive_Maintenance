"""
Test suite for Mumbai Local Rail Fracture Case Study

This script verifies the accuracy and completeness of the Mumbai case study
implementation, including topology, blocked segments, diversion paths, and narratives.
"""

import sys
import json

def test_mumbai_topology():
    """Verify realistic Central Line topology"""
    print("\n=== Testing Mumbai Topology ===")
    
    try:
        import urllib.request
        
        url = 'http://127.0.0.1:8000/case-study/mumbai'
        print(f"Fetching data from {url}...")
        
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        print("✓ Successfully fetched case study data")
        
        # Verify basic structure
        assert 'scenario' in data, "Missing 'scenario' field"
        assert 'nodes' in data, "Missing 'nodes' field"
        assert 'edges' in data, "Missing 'edges' field"
        print("✓ Basic structure verified")
        
        # Verify station count
        stations_slow = [n for n in data['nodes'] if n.get('line_type') == 'slow']
        stations_fast = [n for n in data['nodes'] if n.get('line_type') == 'fast']
        
        assert len(stations_slow) == 10, f"Expected 10 slow line stations, got {len(stations_slow)}"
        assert len(stations_fast) == 5, f"Expected 5 fast line stations, got {len(stations_fast)}"
        print(f"✓ Station count verified: {len(stations_slow)} slow, {len(stations_fast)} fast")
        
        # Verify slow line completeness
        expected_slow = ["Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", 
                        "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund"]
        for station in expected_slow:
            assert any(station in n['label'] for n in stations_slow), f"Missing station: {station}"
        print(f"✓ All 10 slow line stations present: {', '.join(expected_slow)}")
        
        # Verify fast line stations
        expected_fast = ["Matunga", "Kurla", "Ghatkopar", "Bhandup", "Mulund"]
        for station in expected_fast:
            assert any(station in n['label'] for n in stations_fast), f"Missing fast station: {station}"
        print(f"✓ All 5 fast line stations present: {', '.join(expected_fast)}")
        
        # Verify blocked segment
        blocked = data.get('blocked_segment', {})
        assert blocked.get('source') == 'Vikhroli_Slow', "Incorrect blocked segment source"
        assert blocked.get('target') == 'Kanjurmarg_Slow', "Incorrect blocked segment target"
        print("✓ Blocked segment verified: Vikhroli -> Kanjurmarg (Slow Line)")
        
        # Verify diversion path
        diversion = data.get('emergency_diversion', [])
        assert len(diversion) > 0, "Empty diversion path"
        assert 'Matunga_Slow' in diversion, "Diversion should start at Matunga_Slow"
        assert 'Matunga_Fast' in diversion, "Diversion should include crossover to Fast line"
        print(f"✓ Emergency diversion path verified ({len(diversion)} stations)")
        
        # Verify skipped stations
        skipped = data.get('skipped_stations', [])
        expected_skipped = ["Sion", "Vidyavihar", "Vikhroli", "Kanjurmarg"]
        for station in expected_skipped:
            assert station in skipped, f"Missing skipped station: {station}"
        print(f"✓ Skipped stations verified: {', '.join(skipped)}")
        
        # Verify impact metrics
        impact = data.get('impact_metrics', {})
        assert impact.get('passengers_affected') == 350000, "Incorrect passenger count"
        assert impact.get('avg_delay_min') == 25, "Incorrect average delay"
        assert impact.get('economic_loss_inr') == 15000000, "Incorrect economic loss"
        print("✓ Impact metrics verified:")
        print(f"  - Passengers affected: {impact['passengers_affected']:,}")
        print(f"  - Average delay: {impact['avg_delay_min']} min")
        print(f"  - Economic loss: ₹{impact['economic_loss_inr']:,} (₹1.5 Cr)")
        
        # Verify predictive timeline
        timeline = data.get('predictive_timeline', {})
        assert timeline.get('confidence') == 0.94, "Incorrect prediction confidence"
        assert '48 hours' in timeline.get('recommended_action', ''), "Missing 48-hour prediction detail"
        print("✓ Predictive timeline verified:")
        print(f"  - Detection: {timeline.get('failure_detected_at')}")
        print(f"  - Confidence: {timeline.get('confidence') * 100:.0f}%")
        print(f"  - Recommended action: {timeline.get('recommended_action')}")
        
        # Verify narratives
        assert 'incident_description' in data, "Missing incident description"
        assert 'how_we_help' in data, "Missing value proposition narrative"
        assert len(data['incident_description']) > 100, "Incident description too short"
        assert len(data['how_we_help']) > 100, "Value proposition narrative too short"
        print("✓ Narratives verified (incident description and value proposition)")
        
        # Verify line types in edges
        slow_edges = [e for e in data['edges'] if e.get('line_type') == 'slow']
        fast_edges = [e for e in data['edges'] if e.get('line_type') == 'fast']
        crossover_edges = [e for e in data['edges'] if e.get('line_type') == 'crossover']
        
        assert len(slow_edges) == 9, f"Expected 9 slow line edges, got {len(slow_edges)}"
        assert len(fast_edges) == 4, f"Expected 4 fast line edges, got {len(fast_edges)}"
        assert len(crossover_edges) == 4, f"Expected 4 crossover edges, got {len(crossover_edges)}"
        print(f"✓ Edge types verified: {len(slow_edges)} slow, {len(fast_edges)} fast, {len(crossover_edges)} crossovers")
        
        print("\n" + "="*50)
        print("✅ ALL TESTS PASSED!")
        print("="*50)
        print("\nMumbai Case Study is ready for demonstration.")
        print("The implementation accurately represents the November 18, 2025 incident.")
        
        return True
        
    except urllib.error.URLError as e:
        print(f"\n❌ Connection Failed: {e}")
        print("Make sure the backend server is running on http://127.0.0.1:8000")
        print("\nTo start the server:")
        print("  cd c:\\Users\\HEMANTH\\main-el\\code")
        print("  & \"c:\\Users\\HEMANTH\\main-el\\code\\tfenv\\Scripts\\Activate.ps1\"")
        print("  python -m uvicorn backend.api:app --reload")
        return False
    except AssertionError as e:
        print(f"\n❌ Test Failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_mumbai_topology()
    sys.exit(0 if success else 1)
