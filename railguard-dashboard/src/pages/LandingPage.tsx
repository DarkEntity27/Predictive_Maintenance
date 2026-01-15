import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, TrendingUp, Shield, Zap, Activity, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Train size={32} />
            <span className="logo-text">
              Rail<span className="logo-accent">Guard</span>
            </span>
          </div>
          <div className="header-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              System Online
            </div>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Open Dashboard →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <Activity size={16} />
          <span>AI-Powered Predictive Maintenance</span>
        </div>
        <h1 className="hero-title">
          Smarter <span className="text-accent">Railway</span>
          <br />
          Infrastructure
        </h1>
        <p className="hero-description">
          Predict track failures before they happen. Our AI analyzes sensor data
          <br />
          to prioritize maintenance, reduce costs, and ensure passenger safety.
        </p>
        <div className="hero-actions">
          <button className="btn-hero" onClick={() => navigate('/dashboard')}>
            <Activity size={20} />
            Launch Dashboard
          </button>
          <button className="btn-secondary">View Documentation</button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-value">99.2%</div>
          <div className="stat-label">Prediction Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">45%</div>
          <div className="stat-label">Cost Reduction</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">60%</div>
          <div className="stat-label">Faster Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Monitoring</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">
          Intelligent <span className="text-accent">Maintenance</span> Platform
        </h2>
        <p className="section-subtitle">
          Leverage cutting-edge AI to transform how you maintain railway infrastructure
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={32} />
            </div>
            <h3 className="feature-title">AI-Powered Predictions</h3>
            <p className="feature-description">
              Advanced machine learning models analyze track conditions to predict failures
              with 99.2% accuracy
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3 className="feature-title">Risk Assessment</h3>
            <p className="feature-description">
              Real-time prioritization of maintenance needs based on risk scores and critical
              thresholds
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={32} />
            </div>
            <h3 className="feature-title">Instant Insights</h3>
            <p className="feature-description">
              Get actionable recommendations instantly with our intelligent decision support
              system
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">
          How It <span className="text-accent">Works</span>
        </h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <Activity size={24} />
            </div>
            <h3 className="step-title">Collect Data</h3>
            <p className="step-description">
              Sensors monitor track conditions including wear, vibration, and alignment in
              real-time.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="step-title">AI Analysis</h3>
            <p className="step-description">
              Our ML models process the data to detect patterns and predict potential failures.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <CheckCircle size={24} />
            </div>
            <h3 className="step-title">Take Action</h3>
            <p className="step-description">
              Receive prioritized maintenance recommendations to prevent costly breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to <span className="text-accent">Transform</span> Your Maintenance?
          </h2>
          <p className="cta-description">
            Start analyzing your track segments now and get AI-powered maintenance
            <br />
            recommendations.
          </p>
          <button className="btn-cta" onClick={() => navigate('/dashboard')}>
            <CheckCircle size={20} />
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <Train size={20} />
            <span>RailGuard © 2026</span>
          </div>
          <div className="footer-right">AI-Powered Railway Predictive Maintenance Platform</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
