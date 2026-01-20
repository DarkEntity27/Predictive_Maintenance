import React from 'react';
import { Users, Clock, AlertTriangle, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';

interface CaseStudyNarrativeProps {
    data: any;
}

const CaseStudyNarrative: React.FC<CaseStudyNarrativeProps> = ({ data }) => {
    if (!data) return null;

    const {
        scenario,
        incident_date,
        incident_time,
        location,
        root_cause,
        incident_description,
        how_we_help,
        impact_metrics,
        predictive_timeline
    } = data;

    return (
        <div className="case-study-narrative">
            {/* Header */}
            <div className="case-study-header">
                <div className="header-icon">
                    <AlertTriangle size={32} color="#ef4444" />
                </div>
                <div className="header-content">
                    <h2>{scenario}</h2>
                    <div className="incident-meta">
                        <span className="meta-item">
                            <Clock size={16} />
                            {incident_date} at {incident_time}
                        </span>
                        <span className="meta-item">
                            <TrendingUp size={16} />
                            {location}
                        </span>
                    </div>
                </div>
            </div>

            {/* Incident Summary */}
            <section className="narrative-section incident-summary">
                <h3>What Happened</h3>
                <div className="incident-box">
                    <div className="incident-cause">
                        <strong>Root Cause:</strong> {root_cause}
                    </div>
                    <p>{incident_description}</p>
                </div>
            </section>

            {/* Impact Metrics */}
            <section className="narrative-section impact-analysis">
                <h3>The Impact</h3>
                <div className="metrics-grid">
                    <div className="metric-card critical">
                        <div className="metric-icon">
                            <Users size={24} />
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{(impact_metrics.passengers_affected / 1000).toFixed(0)}K</div>
                            <div className="metric-label">Passengers Affected</div>
                        </div>
                    </div>

                    <div className="metric-card warning">
                        <div className="metric-icon">
                            <Clock size={24} />
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{impact_metrics.avg_delay_min} min</div>
                            <div className="metric-label">Average Delay</div>
                        </div>
                    </div>

                    <div className="metric-card danger">
                        <div className="metric-icon">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{impact_metrics.stampede_incidents}</div>
                            <div className="metric-label">Stampede Incidents</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon">
                            <DollarSign size={24} />
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">₹{(impact_metrics.economic_loss_inr / 10000000).toFixed(1)} Cr</div>
                            <div className="metric-label">Economic Loss</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Solution */}
            <section className="narrative-section our-solution">
                <h3>How RailGuard Would Have Prevented This</h3>
                <div className="solution-box">
                    <p className="solution-intro">{how_we_help}</p>

                    <div className="timeline">
                        <div className="timeline-item prediction">
                            <div className="timeline-marker">
                                <TrendingUp size={20} />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-time">{predictive_timeline.failure_detected_at}</div>
                                <div className="timeline-title">Failure Predicted</div>
                                <div className="timeline-description">
                                    {predictive_timeline.detection_method}
                                    <br />
                                    <strong>Confidence: {(predictive_timeline.confidence * 100).toFixed(0)}%</strong>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item alert">
                            <div className="timeline-marker">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-time">Nov 16, 11:00 AM</div>
                                <div className="timeline-title">Critical Alert Sent</div>
                                <div className="timeline-description">
                                    Automated notification to maintenance team
                                    <br />
                                    <strong>Priority: CRITICAL</strong>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item action">
                            <div className="timeline-marker">
                                <CheckCircle size={20} />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-time">{predictive_timeline.maintenance_window}</div>
                                <div className="timeline-title">Scheduled Maintenance</div>
                                <div className="timeline-description">
                                    {predictive_timeline.recommended_action}
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item success">
                            <div className="timeline-marker">
                                <CheckCircle size={20} />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-time">Nov 18, 7:32 AM</div>
                                <div className="timeline-title">Normal Operations</div>
                                <div className="timeline-description">
                                    <strong>{predictive_timeline.prevention_outcome}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="narrative-section comparison">
                <h3>The Difference</h3>
                <div className="comparison-table">
                    <div className="comparison-row header">
                        <div className="comparison-cell"></div>
                        <div className="comparison-cell">Without RailGuard</div>
                        <div className="comparison-cell">With RailGuard</div>
                    </div>
                    <div className="comparison-row">
                        <div className="comparison-cell label">Detection Time</div>
                        <div className="comparison-cell negative">7:32 AM (During incident)</div>
                        <div className="comparison-cell positive">48 hours before failure</div>
                    </div>
                    <div className="comparison-row">
                        <div className="comparison-cell label">Response</div>
                        <div className="comparison-cell negative">Emergency rerouting</div>
                        <div className="comparison-cell positive">Scheduled off-peak maintenance</div>
                    </div>
                    <div className="comparison-row">
                        <div className="comparison-cell label">Passenger Impact</div>
                        <div className="comparison-cell negative">350K affected, stampedes</div>
                        <div className="comparison-cell positive">Zero disruption</div>
                    </div>
                    <div className="comparison-row">
                        <div className="comparison-cell label">Economic Loss</div>
                        <div className="comparison-cell negative">₹1.5 Crore</div>
                        <div className="comparison-cell positive">₹0</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CaseStudyNarrative;
