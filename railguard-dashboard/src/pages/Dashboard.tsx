import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Train,
  Home,
  LayoutGrid,
  History,
  FileText,
  Settings,
  Bell,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  Download,
  GitMerge,
  X,
} from 'lucide-react';
import { maintenanceApi } from '../services/api';
import { SegmentInput, NetworkAssessmentResponse, DiversionPlan } from '../types';
import { getPriorityLabel, formatConfidence, getPriorityColor } from '../utils/helpers';
import NetworkMap from '../components/NetworkMap';
import './Dashboard.css';

interface SegmentState {
  wear_level: number;
  alignment_deviation: number;
  vibration_index: number;
  environment_factor: number;
  load_cycles: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [numSegments, setNumSegments] = useState(4);
  const [segments, setSegments] = useState<SegmentState[]>(
    Array(4)
      .fill(null)
      .map(() => ({
        wear_level: 0.3,
        alignment_deviation: 2.0,
        vibration_index: 30.0,
        environment_factor: 1.0,
        load_cycles: 500,
      }))
  );
  const [assessmentData, setAssessmentData] = useState<NetworkAssessmentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports' | 'settings'>('overview');
  const [assessmentHistory, setAssessmentHistory] = useState<Array<{ timestamp: string; data: NetworkAssessmentResponse }>>([]);
  const [selectedDiversion, setSelectedDiversion] = useState<DiversionPlan | null>(null);

  const updateSegment = (index: number, field: keyof SegmentState, value: number) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const handleNumSegmentsChange = (newNum: number) => {
    setNumSegments(newNum);
    if (newNum > segments.length) {
      // Add new segments
      const additional = Array(newNum - segments.length)
        .fill(null)
        .map(() => ({
          wear_level: 0.3,
          alignment_deviation: 2.0,
          vibration_index: 30.0,
          environment_factor: 1.0,
          load_cycles: 500,
        }));
      setSegments([...segments, ...additional]);
    } else {
      // Remove excess segments
      setSegments(segments.slice(0, newNum));
    }
  };

  const handleAssess = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: SegmentInput[] = segments.map((seg, idx) => ({
        segment_id: idx + 1,
        features: [
          seg.wear_level,
          seg.alignment_deviation,
          seg.vibration_index,
          seg.environment_factor,
          seg.load_cycles,
        ],
      }));

      const response = await maintenanceApi.assessNetwork({ segments: request });
      setAssessmentData(response);
      // Add to history
      setAssessmentHistory([
        {
          timestamp: new Date().toLocaleString(),
          data: response,
        },
        ...assessmentHistory.slice(0, 9), // Keep last 10
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to assess network');
      console.error('Assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Train size={28} />
          <span className="sidebar-title">Input Segments</span>
        </div>

        <div className="segment-controls">
          <label className="control-label">Number of track segments</label>
          <div className="number-input">
            <button
              onClick={() => handleNumSegmentsChange(Math.max(1, numSegments - 1))}
              className="btn-number"
            >
              −
            </button>
            <span className="number-value">{numSegments}</span>
            <button
              onClick={() => handleNumSegmentsChange(Math.min(10, numSegments + 1))}
              className="btn-number"
            >
              +
            </button>
          </div>
        </div>

        <div className="segments-list">
          {segments.map((segment, idx) => (
            <div key={idx} className="segment-item">
              <div className="segment-header">
                <span className="segment-bullet">●</span>
                <span className="segment-name">Segment {idx + 1}</span>
              </div>

              <div className="slider-group">
                <label>Wear Level</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={segment.wear_level}
                    onChange={(e) => updateSegment(idx, 'wear_level', parseFloat(e.target.value))}
                    className="slider"
                    style={{ '--slider-color': getSliderColor(segment.wear_level, 0.5) } as any}
                  />
                  <span className="slider-value">{segment.wear_level.toFixed(2)}</span>
                </div>
              </div>

              <div className="slider-group">
                <label>Alignment Deviation</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={segment.alignment_deviation}
                    onChange={(e) =>
                      updateSegment(idx, 'alignment_deviation', parseFloat(e.target.value))
                    }
                    className="slider"
                    style={{ '--slider-color': getSliderColor(segment.alignment_deviation, 5) } as any}
                  />
                  <span className="slider-value">{segment.alignment_deviation.toFixed(1)}</span>
                </div>
              </div>

              <div className="slider-group">
                <label>Vibration Index</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={segment.vibration_index}
                    onChange={(e) =>
                      updateSegment(idx, 'vibration_index', parseFloat(e.target.value))
                    }
                    className="slider"
                    style={{ '--slider-color': getSliderColor(segment.vibration_index, 50) } as any}
                  />
                  <span className="slider-value">{segment.vibration_index.toFixed(0)}</span>
                </div>
              </div>

              <div className="slider-group">
                <label>Environment Factor</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.01"
                    value={segment.environment_factor}
                    onChange={(e) =>
                      updateSegment(idx, 'environment_factor', parseFloat(e.target.value))
                    }
                    className="slider"
                    style={{ '--slider-color': '#f59e0b' } as any}
                  />
                  <span className="slider-value">{segment.environment_factor.toFixed(2)}</span>
                </div>
              </div>

              <div className="slider-group">
                <label>Load Cycles</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="10"
                    value={segment.load_cycles}
                    onChange={(e) => updateSegment(idx, 'load_cycles', parseFloat(e.target.value))}
                    className="slider"
                    style={{ '--slider-color': '#f59e0b' } as any}
                  />
                  <span className="slider-value">{segment.load_cycles}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleAssess} disabled={loading} className="btn-assess">
          {loading ? 'Analyzing...' : 'Run Assessment'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <Train size={28} />
            <div>
              <h1 className="page-title">
                Railway Track <span className="text-accent">Predictive Maintenance</span>
              </h1>
              <p className="page-subtitle">
                AI-driven fault prediction, maintenance prioritization, and network-level insights
              </p>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="status-indicator">
              <Activity size={16} />
              System Online
            </div>
            <button className="btn-icon">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutGrid size={18} />
            Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            History
          </button>
          <button
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={18} />
            Reports
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            Settings
          </button>
          <button className="nav-tab-home" onClick={() => navigate('/')}>
            <Home size={18} />
            Back to Home
          </button>
        </nav>

        {/* Content Area */}
        <div className="content-area">
          {error && (
            <div className="error-message">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {!assessmentData && !error && (
                <div className="empty-state">
                  <Activity size={48} />
                  <h3>Ready to Analyze</h3>
                  <p>Configure track segments in the sidebar and click "Run Assessment" to begin</p>
                </div>
              )}

              {assessmentData && (
                <>
                  {/* Network Summary */}
                  <section className="section">
                    <div className="section-header">
                      <LayoutGrid size={20} />
                      <h2>Network-Level Summary</h2>
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-icon">
                          <LayoutGrid size={24} />
                        </div>
                        <div className="metric-content">
                          <div className="metric-value">
                            {assessmentData.network_summary.structured.total_segments}
                          </div>
                          <div className="metric-label">Total Segments</div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon warning">
                          <AlertTriangle size={24} />
                        </div>
                        <div className="metric-content">
                          <div className="metric-value">
                            {assessmentData.network_summary.structured.high_priority_segments.length}
                          </div>
                          <div className="metric-label">High Priority</div>
                          <div className="metric-sublabel">Requires attention</div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon success">
                          <CheckCircle size={24} />
                        </div>
                        <div className="metric-content">
                          <div className="metric-value">
                            {assessmentData.network_summary.structured.total_segments -
                              assessmentData.network_summary.structured.high_priority_segments.length}
                          </div>
                          <div className="metric-label">Healthy Segments</div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-icon">
                          <TrendingUp size={24} />
                        </div>
                        <div className="metric-content">
                          <div className="metric-value">
                            {(assessmentData.network_summary.structured.average_confidence * 100).toFixed(
                              1
                            )}
                            %
                          </div>
                          <div className="metric-label">Avg. Confidence</div>
                          <div className="metric-sublabel">Model prediction accuracy</div>
                        </div>
                      </div>
                    </div>

                    <div className="ai-summary-section">
                      <div className="ai-summary-header">
                        <Activity size={20} />
                        <h3>AI-Generated Summary</h3>
                      </div>
                      <div className="ai-summary-content">
                        {assessmentData.network_summary.narrative}
                      </div>
                    </div>
                  </section>

                  {/* Track Visualization */}
                  <section className="section">
                    <div className="section-header">
                      <Train size={20} />
                      <h2>Track Visualization</h2>
                    </div>
                    <div className="track-visualization">
                      {assessmentData.segments.map((seg) => (
                        <div
                          key={seg.segment_id}
                          className={`track-segment priority-${seg.priority}`}
                          style={{ backgroundColor: getPriorityColor(seg.priority) }}
                        >
                          #{seg.segment_id}
                        </div>
                      ))}
                    </div>
                    <div className="track-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                        Critical
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
                        High
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                        Medium
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                        Low
                      </div>
                    </div>

                    <div className="visualization-buttons">
                      <a
                        href="/visualization/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-visualization"
                      >
                        View 3D Visualization
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </section>

                  {/* Segment Assessment Table */}
                  <section className="section">
                    <div className="section-header">
                      <Settings size={20} />
                      <h2>Segment-wise Assessment</h2>
                    </div>
                    <div className="table-container">
                      <table className="assessment-table">
                        <thead>
                          <tr>
                            <th>Segment ID</th>
                            <th>Fault</th>
                            <th>Confidence</th>
                            <th>Priority Level</th>
                            <th>Action</th>
                            <th>Diversion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessmentData.segments.map((seg) => (
                            <tr key={seg.segment_id}>
                              <td>
                                <span className="segment-id-badge">{seg.segment_id}</span>
                              </td>
                              <td>
                                <span className="fault-badge">{seg.fault.replace(/_/g, ' ')}</span>
                              </td>
                              <td>
                                <div className="confidence-bar">
                                  <div
                                    className="confidence-fill"
                                    style={{ width: `${seg.confidence * 100}%` }}
                                  ></div>
                                  <span className="confidence-text">{formatConfidence(seg.confidence)}</span>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`priority-badge priority-${seg.priority}`}
                                  style={{ backgroundColor: getPriorityColor(seg.priority) }}
                                >
                                  {getPriorityLabel(seg.priority)}
                                </span>
                              </td>
                              <td className="action-cell">{seg.action}</td>
                              <td>
                                {seg.diversion_plan && (
                                  <button
                                    className="btn-icon"
                                    title="View Diversion Plan"
                                    onClick={() => setSelectedDiversion(seg.diversion_plan!)}
                                    style={{ color: '#f97316' }}
                                  >
                                    <GitMerge size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <section className="section">
              <div className="section-header">
                <History size={20} />
                <h2>Assessment History</h2>
              </div>
              {assessmentHistory.length === 0 ? (
                <div className="empty-state">
                  <History size={48} />
                  <h3>No History Yet</h3>
                  <p>Run assessments to see them appear here</p>
                </div>
              ) : (
                <div className="history-list">
                  {assessmentHistory.map((entry, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-item-header">
                        <div>
                          <h4>Assessment #{assessmentHistory.length - idx}</h4>
                          <p className="history-timestamp">{entry.timestamp}</p>
                        </div>
                        <div className="history-stats">
                          <span className="stat-badge">{entry.data.segments.length} Segments</span>
                          <span className="stat-badge critical">
                            {entry.data.network_summary.structured.high_priority_segments.length} High Priority
                          </span>
                        </div>
                      </div>
                      <div className="history-summary">
                        {entry.data.network_summary.narrative.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <section className="section">
              <div className="section-header">
                <FileText size={20} />
                <h2>Reports</h2>
              </div>
              {!assessmentData ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <h3>No Reports Available</h3>
                  <p>Run an assessment to generate a report</p>
                </div>
              ) : (
                <div className="reports-container">
                  <div className="report-card">
                    <div className="report-header">
                      <h3>Network Assessment Report</h3>
                      <button className="btn-download">
                        <Download size={18} />
                        Export as JSON
                      </button>
                    </div>
                    <div className="report-content">
                      <div className="report-section">
                        <h4>Assessment Summary</h4>
                        <p>{assessmentData.network_summary.narrative}</p>
                      </div>
                      <div className="report-section">
                        <h4>Key Metrics</h4>
                        <div className="metrics-table">
                          <div className="metric-row">
                            <span>Total Segments:</span>
                            <strong>{assessmentData.network_summary.structured.total_segments}</strong>
                          </div>
                          <div className="metric-row">
                            <span>High Priority Segments:</span>
                            <strong>{assessmentData.network_summary.structured.high_priority_segments.length}</strong>
                          </div>
                          <div className="metric-row">
                            <span>Average Confidence:</span>
                            <strong>
                              {(assessmentData.network_summary.structured.average_confidence * 100).toFixed(1)}%
                            </strong>
                          </div>
                          <div className="metric-row">
                            <span>Critical Faults:</span>
                            <strong>{assessmentData.network_summary.structured.critical_count}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="report-section">
                        <h4>Fault Distribution</h4>
                        <div className="fault-distribution">
                          {Object.entries(assessmentData.network_summary.structured.fault_distribution).map(
                            ([fault, count]) => (
                              <div key={fault} className="fault-item">
                                <span className="fault-name">{fault.replace(/_/g, ' ')}</span>
                                <div className="fault-bar">
                                  <div
                                    className="fault-fill"
                                    style={{
                                      width: `${(count / assessmentData.segments.length) * 100}%`,
                                    }}
                                  ></div>
                                  <span className="fault-count">{count}</span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <section className="section">
              <div className="section-header">
                <Settings size={20} />
                <h2>Settings</h2>
              </div>
              <div className="settings-container">
                <div className="settings-group">
                  <h3>Segment Configuration</h3>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>Maximum Segments</label>
                      <p className="setting-description">Maximum number of track segments to analyze</p>
                    </div>
                    <div className="setting-value">
                      <input type="number" defaultValue="10" min="1" max="100" className="input-number" />
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Analysis Parameters</h3>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>Confidence Threshold</label>
                      <p className="setting-description">Minimum confidence level for predictions</p>
                    </div>
                    <div className="setting-value">
                      <input type="number" defaultValue="0.7" min="0" max="1" step="0.1" className="input-number" />
                    </div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>Priority Alert Level</label>
                      <p className="setting-description">Threshold for high-priority alerts</p>
                    </div>
                    <div className="setting-value">
                      <select className="input-select">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Notifications</h3>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>Enable Email Notifications</label>
                      <p className="setting-description">Receive alerts via email</p>
                    </div>
                    <div className="setting-value">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>Enable Browser Notifications</label>
                      <p className="setting-description">Show notifications in browser</p>
                    </div>
                    <div className="setting-value">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn-save">Save Settings</button>
                  <button className="btn-reset">Reset to Defaults</button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Diversion Plan Modal */}
      {selectedDiversion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-group">
                <GitMerge size={24} className="text-warning" />
                <h3>Train Diversion Plan</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedDiversion(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="alert-box warning">
                <AlertTriangle size={20} />
                <div>
                  <strong>Critical Issue on Segment {selectedDiversion.original_segment}</strong>
                  <p>Traffic must be diverted to avoid the affected track.</p>
                </div>
              </div>

              <div className="diversion-details">
                <div className="detail-item">
                  <span className="label">Estimated Delay</span>
                  <span className="value text-danger">+{selectedDiversion.delay_min} min</span>
                </div>
                <div className="detail-item">
                  <span className="label">Extra Distance</span>
                  <span className="value">+{selectedDiversion.total_distance_km} km</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Time</span>
                  <span className="value">{selectedDiversion.estimated_time_min} min</span>
                </div>
              </div>

              <div className="route-timeline">
                <h4>Network Visualization</h4>
                {selectedDiversion.graph_data ? (
                  <NetworkMap
                    data={selectedDiversion.graph_data}
                    diversionPath={selectedDiversion.stations_involved}
                  />
                ) : (
                  <div className="timeline-steps">
                    {selectedDiversion.diversion_path.map((step, idx) => (
                      <div key={idx} className="timeline-step">
                        <div className="step-marker"></div>
                        <div className="step-content">{step}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getSliderColor = (value: number, threshold: number): string => {
  if (value >= threshold * 1.5) return '#ef4444';
  if (value >= threshold) return '#f97316';
  if (value >= threshold * 0.5) return '#f59e0b';
  return '#10b981';
};

export default Dashboard;
