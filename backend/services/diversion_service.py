import networkx as nx

class DiversionService:
    def __init__(self):
        # Create a mock railway network graph
        self.graph = nx.Graph()
        
        # Define stations (nodes) and segments (edges)
        # We assume segment_id maps to an edge
        # (u, v, {'segment_id': id, 'length_km': dist, 'time_min': time})
        
        # Main Line: A -> B -> C -> D -> E
        self.graph.add_edge("Station_A", "Station_B", segment_id=1, length_km=10, time_min=12)
        self.graph.add_edge("Station_B", "Station_C", segment_id=2, length_km=15, time_min=18)
        self.graph.add_edge("Station_C", "Station_D", segment_id=3, length_km=12, time_min=14)
        self.graph.add_edge("Station_D", "Station_E", segment_id=4, length_km=20, time_min=25)
        
        # Bypass Line 1 (Bypasses Segment 2): B -> F -> C
        self.graph.add_edge("Station_B", "Station_F", segment_id=101, length_km=8, time_min=10)
        self.graph.add_edge("Station_F", "Station_C", segment_id=102, length_km=9, time_min=11)
        
        # Bypass Line 2 (Bypasses Segment 3): C -> G -> D
        self.graph.add_edge("Station_C", "Station_G", segment_id=201, length_km=10, time_min=12)
        self.graph.add_edge("Station_G", "Station_D", segment_id=202, length_km=8, time_min=10)

        # Bypass Line 3 (Long bypass for Segment 1): A -> H -> B
        self.graph.add_edge("Station_A", "Station_H", segment_id=301, length_km=15, time_min=20)
        self.graph.add_edge("Station_H", "Station_B", segment_id=302, length_km=12, time_min=15)

        # Node Positions for Visualization (x, y)
        # Scale: 0-400 for x, 0-100 for y
        self.node_positions = {
            "Station_A": {"x": 50, "y": 50},
            "Station_B": {"x": 150, "y": 50},
            "Station_C": {"x": 250, "y": 50},
            "Station_D": {"x": 350, "y": 50},
            "Station_E": {"x": 450, "y": 50},
            "Station_F": {"x": 200, "y": 20}, # Above B-C
            "Station_G": {"x": 300, "y": 80}, # Below C-D
            "Station_H": {"x": 100, "y": 80}, # Below A-B
        }
        
        nx.set_node_attributes(self.graph, self.node_positions, 'pos')

    def get_diversion_plan(self, blocked_segment_id):
        """
        Calculate diversion path if a segment is blocked.
        """
        # Find the edge corresponding to the blocked segment
        blocked_edge = None
        for u, v, data in self.graph.edges(data=True):
            if data.get('segment_id') == blocked_segment_id:
                blocked_edge = (u, v)
                break
        
        if not blocked_edge:
            return None # Segment not in our graph logic
            
        u, v = blocked_edge
        original_data = self.graph.get_edge_data(u, v)
        original_time = original_data['time_min']
        
        # Create a temporary graph without the blocked edge
        temp_graph = self.graph.copy()
        temp_graph.remove_edge(u, v)
        
        try:
            # Find shortest path in the modified graph
            path = nx.shortest_path(temp_graph, source=u, target=v, weight='time_min')
            
            # Calculate total time and distance for the new path
            diversion_time = 0
            diversion_distance = 0
            path_segments = []
            
            for i in range(len(path) - 1):
                p_u, p_v = path[i], path[i+1]
                edge_data = temp_graph.get_edge_data(p_u, p_v)
                diversion_time += edge_data['time_min']
                diversion_distance += edge_data['length_km']
                path_segments.append(f"{p_u} -> {p_v} (Seg {edge_data['segment_id']})")
                
            delay = diversion_time - original_time
            
            return {
                "original_segment": blocked_segment_id,
                "diversion_path": path_segments,
                "total_distance_km": diversion_distance,
                "estimated_time_min": diversion_time,
                "delay_min": delay,
                "stations_involved": path,
                "graph_data": {
                    "nodes": [{"id": n, **self.graph.nodes[n]['pos']} for n in self.graph.nodes()],
                    "edges": [{"source": u, "target": v, "segment_id": d['segment_id']} for u, v, d in self.graph.edges(data=True)],
                    "blocked_edge": {"source": u, "target": v}
                }
            }
            
        except nx.NetworkXNoPath:
            return {
                "error": "No diversion path available. Track is completely isolated."
            }
