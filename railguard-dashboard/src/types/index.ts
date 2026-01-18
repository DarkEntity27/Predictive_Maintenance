// TypeScript types for the Railway Maintenance application

export interface SegmentFeatures {
  wear_level: number;
  alignment_deviation: number;
  vibration_index: number;
  environment_factor: number;
  load_cycles: number;
}

export interface SegmentInput {
  segment_id: number;
  features: number[]; // [wear, alignment, vibration, env, load]
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  segment_id: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  blocked_edge: { source: string; target: string };
}

export interface DiversionPlan {
  original_segment: number;
  diversion_path: string[];
  total_distance_km: number;
  estimated_time_min: number;
  delay_min: number;
  stations_involved: string[];
  graph_data: GraphData;
}

export interface SegmentResult {
  segment_id: number;
  fault: string;
  confidence: number;
  priority: number;
  action: string;
  explanation?: string;
  diversion_plan?: DiversionPlan;
}

export interface FaultDistribution {
  [faultType: string]: number;
}

export interface NetworkSummaryStructured {
  total_segments: number;
  high_priority_segments: number[];
  fault_distribution: FaultDistribution;
  average_confidence: number;
  critical_count: number;
}

export interface NetworkPath {
  path_found: boolean;
  stations_involved: string[];
  total_time_min: number;
  total_distance_km: number;
  delay_min: number;
  blocked_segments: number[];
  graph_data: GraphData & { blocked_edges: { source: string; target: string }[] };
  error?: string;
}

export interface NetworkSummary {
  structured: NetworkSummaryStructured;
  narrative: string;
  network_path: NetworkPath;
}

export interface NetworkAssessmentResponse {
  segments: SegmentResult[];
  network_summary: NetworkSummary;
}

export interface BatchRequest {
  segments: SegmentInput[];
}

// Metro APU Types
export interface APUPredictRequest {
  sensor_window: number[][];  // 180 timesteps x 15 features
  car_id: number;
}

export interface APULocation {
  car_id: number;
  zone: string;
  system: string;
}

export interface APUPredictResponse {
  rul_hours: number;
  priority: number;
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
  confidence: number;
  location: APULocation;
  action: string;
  explanation?: {
    summary: string;
    key_factors: string;
    explanation: string;
  };
  alert_sent?: boolean;
}

export interface APUSensorData {
  [key: string]: number;
}

export interface MetroCar {
  id: number;
  name: string;
  rul: number;
  status: 'Critical' | 'Warning' | 'Normal';
  confidence: number;
  sensors: APUSensorData;
}

export interface MaintenanceHistory {
  car_id: number;
  car_name: string;
  maintenance_type: string;
  date: string;
  rul_before: number;
  rul_after: number;
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export type PriorityLevel = 1 | 2 | 3 | 4;

export interface PriorityColorMap {
  [key: number]: {
    label: string;
    color: string;
    emoji: string;
  };
}
