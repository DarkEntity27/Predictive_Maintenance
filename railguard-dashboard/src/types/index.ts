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

export interface SegmentResult {
  segment_id: number;
  fault: string;
  confidence: number;
  priority: number;
  action: string;
  explanation?: string;
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

export interface NetworkSummary {
  structured: NetworkSummaryStructured;
  narrative: string;
}

export interface NetworkAssessmentResponse {
  segments: SegmentResult[];
  network_summary: NetworkSummary;
}

export interface BatchRequest {
  segments: SegmentInput[];
}

export type PriorityLevel = 1 | 2 | 3 | 4;

export interface PriorityColorMap {
  [key: number]: {
    label: string;
    color: string;
    emoji: string;
  };
}
