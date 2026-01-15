import { PriorityColorMap } from '../types';

export const PRIORITY_COLORS: PriorityColorMap = {
  1: {
    label: 'Normal',
    color: '#10b981',
    emoji: '🟢',
  },
  2: {
    label: 'Preventive',
    color: '#f59e0b',
    emoji: '🟡',
  },
  3: {
    label: 'High Priority',
    color: '#f97316',
    emoji: '🟠',
  },
  4: {
    label: 'Critical',
    color: '#ef4444',
    emoji: '🔴',
  },
};

export const getPriorityColor = (priority: number): string => {
  return PRIORITY_COLORS[priority]?.color || '#6b7280';
};

export const getPriorityLabel = (priority: number): string => {
  const info = PRIORITY_COLORS[priority];
  return info ? `${info.emoji} ${info.label}` : 'Unknown';
};

export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(1)}%`;
};
