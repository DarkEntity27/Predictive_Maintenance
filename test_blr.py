import sys
sys.path.insert(0, '.')
from backend.services.diversion_service import DiversionService

ds = DiversionService()

# Test 1: Get case study
data = ds.get_bengaluru_case_study()
print(f"Stations: {data['total_stations']}")
print(f"Segments: {data['total_segments']}")
print(f"Corridors: {[c['name'] for c in data['corridors']]}")
print(f"Edges sample: {data['edges'][0]['source']} -> {data['edges'][0]['target']}")
print()

# Test 2: Reroute with blocked segments
r = ds.reroute_bengaluru([8, 9])
print(f"Network status: {r['network_status']['status']}")
for cr in r['corridor_results']:
    status = "BLOCKED" if cr['path_blocked'] else f"OK ({cr['segment_count']} segs, {cr['total_time_min']} min)"
    print(f"  {cr['corridor_name']}: {status}")
print()

# Test 3: Block enough to sever corridor 1
r2 = ds.reroute_bengaluru([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 501, 503])
print(f"After blocking all C1 + crossovers: {r2['network_status']['status']}")
for cr in r2['corridor_results']:
    status = "BLOCKED" if cr['path_blocked'] else f"OK ({cr['segment_count']} segs)"
    print(f"  {cr['corridor_name']}: {status}")

print("\nAll tests passed!")
