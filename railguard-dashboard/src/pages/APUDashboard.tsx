import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Activity, Clock, FileText, Settings, 
  Plus, RefreshCw, Shuffle, AlertTriangle, 
  CheckCircle, TrendingUp, Grid, ChevronDown, ExternalLink
} from 'lucide-react';
import { apuApi } from '../services/api';
import { MetroCar, APUPredictRequest, MaintenanceHistory } from '../types';
import './APUDashboard.css';

const APUDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports' | 'settings'>('overview');
  const [selectedCar, setSelectedCar] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastInference, setLastInference] = useState<string>('Never');
  
  // Metro Cars State - with 15 sensor features
  const [metroCars, setMetroCars] = useState<MetroCar[]>([
    {
      id: 1,
      name: 'Car 1',
      rul: 45.2,
      status: 'Critical',
      confidence: 92,
      sensors: {
        cycle_index: 0.85,
        compressor_pressure: 0.90,
        aftercooler_pressure: 0.88,
        electrical_signal: 0.82,
        dryer_pressure: 0.85,
        reservoir_pressure: 0.40,
        oil_temperature: 0.92,
        motor_current: 0.88,
        compressor_state: 0.90,
        dryer_state: 0.75,
        dryer_tower_state: 0.80,
        pressure_gradient: 0.85,
        low_pressure_signal: 0.78,
        pressure_switch: 0.82,
        oil_level: 0.20,
      }
    },
    {
      id: 2,
      name: 'Car 2',
      rul: 185.8,
      status: 'Normal',
      confidence: 48,
      sensors: {
        cycle_index: 0.25,
        compressor_pressure: 0.30,
        aftercooler_pressure: 0.28,
        electrical_signal: 0.22,
        dryer_pressure: 0.25,
        reservoir_pressure: 0.40,
        oil_temperature: 0.32,
        motor_current: 0.28,
        compressor_state: 0.30,
        dryer_state: 0.25,
        dryer_tower_state: 0.22,
        pressure_gradient: 0.25,
        low_pressure_signal: 0.28,
        pressure_switch: 0.20,
        oil_level: 0.35,
      }
    },
    {
      id: 3,
      name: 'Car 3',
      rul: 120.5,
      status: 'Warning',
      confidence: 73,
      sensors: {
        cycle_index: 0.55,
        compressor_pressure: 0.60,
        aftercooler_pressure: 0.58,
        electrical_signal: 0.52,
        dryer_pressure: 0.55,
        reservoir_pressure: 0.65,
        oil_temperature: 0.62,
        motor_current: 0.58,
        compressor_state: 0.60,
        dryer_state: 0.55,
        dryer_tower_state: 0.58,
        pressure_gradient: 0.60,
        low_pressure_signal: 0.55,
        pressure_switch: 0.58,
        oil_level: 0.50,
      }
    },
    {
      id: 4,
      name: 'Car 4',
      rul: 200.1,
      status: 'Normal',
      confidence: 62,
      sensors: {
        cycle_index: 0.30,
        compressor_pressure: 0.35,
        aftercooler_pressure: 0.32,
        electrical_signal: 0.28,
        dryer_pressure: 0.30,
        reservoir_pressure: 0.45,
        oil_temperature: 0.38,
        motor_current: 0.32,
        compressor_state: 0.35,
        dryer_state: 0.28,
        dryer_tower_state: 0.30,
        pressure_gradient: 0.32,
        low_pressure_signal: 0.35,
        pressure_switch: 0.28,
        oil_level: 0.42,
      }
    },
    {
      id: 5,
      name: 'Car 5',
      rul: 95.3,
      status: 'Warning',
      confidence: 81,
      sensors: {
        cycle_index: 0.65,
        compressor_pressure: 0.70,
        aftercooler_pressure: 0.68,
        electrical_signal: 0.62,
        dryer_pressure: 0.65,
        reservoir_pressure: 0.75,
        oil_temperature: 0.72,
        motor_current: 0.68,
        compressor_state: 0.70,
        dryer_state: 0.65,
        dryer_tower_state: 0.68,
        pressure_gradient: 0.70,
        low_pressure_signal: 0.65,
        pressure_switch: 0.68,
        oil_level: 0.60,
      }
    },
    {
      id: 6,
      name: 'Car 6',
      rul: 215.7,
      status: 'Normal',
      confidence: 55,
      sensors: {
        cycle_index: 0.22,
        compressor_pressure: 0.28,
        aftercooler_pressure: 0.25,
        electrical_signal: 0.20,
        dryer_pressure: 0.22,
        reservoir_pressure: 0.38,
        oil_temperature: 0.30,
        motor_current: 0.25,
        compressor_state: 0.28,
        dryer_state: 0.22,
        dryer_tower_state: 0.25,
        pressure_gradient: 0.28,
        low_pressure_signal: 0.22,
        pressure_switch: 0.25,
        oil_level: 0.38,
      }
    },
  ]);

  const [maintenanceHistory] = useState<MaintenanceHistory[]>([
    {
      car_id: 3,
      car_name: 'Car 3',
      maintenance_type: 'Compressor Replacement',
      date: 'Wed, Jan 14',
      rul_before: 45,
      rul_after: 480,
      status: 'Completed'
    },
    {
      car_id: 1,
      car_name: 'Car 1',
      maintenance_type: 'Thermal Sensor Calibration',
      date: 'Mon, Jan 12',
      rul_before: 120,
      rul_after: 350,
      status: 'Completed'
    },
    {
      car_id: 5,
      car_name: 'Car 5',
      maintenance_type: 'Pressure Valve Inspection',
      date: 'Thu, Jan 15',
      rul_before: 180,
      rul_after: 180,
      status: 'In Progress'
    },
    {
      car_id: 2,
      car_name: 'Car 2',
      maintenance_type: 'Air Dryer Maintenance',
      date: 'Fri, Jan 16',
      rul_before: 220,
      rul_after: 220,
      status: 'Scheduled'
    },
  ]);

  const selectedCarData = metroCars.find(car => car.id === selectedCar) || metroCars[0];

  const getSensorDisplayName = (key: string): string => {
    const names: { [key: string]: string } = {
      cycle_index: 'Cycle Index',
      compressor_pressure: 'Compressor Outlet',
      aftercooler_pressure: 'Aftercooler Pressure',
      electrical_signal: 'Electrical Signal',
      dryer_pressure: 'Dryer Pressure',
      reservoir_pressure: 'Reservoir Pressure',
      oil_temperature: 'Oil Temperature',
      motor_current: 'Motor Current',
      compressor_state: 'Compressor State',
      dryer_state: 'Dryer Electrical',
      dryer_tower_state: 'Dryer Tower State',
      pressure_gradient: 'Pressure Gradient',
      low_pressure_signal: 'Low-Pressure Signal',
      pressure_switch: 'Pressure Switch',
      oil_level: 'Oil Level',
    };
    return names[key] || key;
  };

  const getSensorIcon = (key: string): string => {
    const icons: { [key: string]: string } = {
      cycle_index: '⚡',
      compressor_pressure: '↗',
      aftercooler_pressure: '↗',
      electrical_signal: '⚡',
      dryer_pressure: '↗',
      reservoir_pressure: '≈',
      oil_temperature: '🌡',
      motor_current: '⚡',
      compressor_state: '⚙',
      dryer_state: '⚡',
      dryer_tower_state: '🗼',
      pressure_gradient: '📈',
      low_pressure_signal: '⚠️',
      pressure_switch: '🔄',
      oil_level: '🛢️',
    };
    return icons[key] || '📊';
  };

  const getSensorUnit = (key: string): string => {
    const units: { [key: string]: string } = {
      cycle_index: 'Unnamed: 0',
      compressor_pressure: 'TP2',
      aftercooler_pressure: 'TP3',
      electrical_signal: 'H1',
      dryer_pressure: 'DV_pressure',
      reservoir_pressure: 'Reservoirs',
      oil_temperature: 'Oil_temperature',
      motor_current: 'Motor_current',
      compressor_state: 'COMP',
      dryer_state: 'DV_electric',
      dryer_tower_state: 'Towers',
      pressure_gradient: 'MPG',
      low_pressure_signal: 'LPS',
      pressure_switch: 'Pressure_switch',
      oil_level: 'Oil_level',
    };
    return units[key] || '';
  };

  const handleSensorChange = (key: string, value: number) => {
    const updatedCars = [...metroCars];
    const carIndex = updatedCars.findIndex(c => c.id === selectedCar);
    if (carIndex !== -1) {
      updatedCars[carIndex].sensors[key] = value;
      setMetroCars(updatedCars);
    }
  };

  const handleReset = () => {
    const updatedCars = metroCars.map(car => {
      if (car.id === selectedCar) {
        const resetSensors: { [key: string]: number } = {};
        Object.keys(car.sensors).forEach(key => {
          resetSensors[key] = 0.5;
        });
        return { ...car, sensors: resetSensors };
      }
      return car;
    });
    setMetroCars(updatedCars);
  };

  const handleRandom = () => {
    const updatedCars = metroCars.map(car => {
      if (car.id === selectedCar) {
        const randomSensors: { [key: string]: number } = {};
        Object.keys(car.sensors).forEach(key => {
          randomSensors[key] = Math.random();
        });
        return { ...car, sensors: randomSensors };
      }
      return car;
    });
    setMetroCars(updatedCars);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      console.log('Starting prediction for car:', selectedCar);
      
      // Generate 180 timesteps of sensor data
      const sensorWindow: number[][] = [];
      const sensorValues = Object.values(selectedCarData.sensors);
      
      console.log('Sensor values:', sensorValues);
      console.log('Number of features:', sensorValues.length);
      
      for (let i = 0; i < 180; i++) {
        // Add some variation to simulate time series
        const timestep = sensorValues.map(val => {
          const variation = (Math.random() - 0.5) * 0.1;
          return Math.max(0, Math.min(1, val + variation));
        });
        
        sensorWindow.push(timestep);
      }

      const request: APUPredictRequest = {
        sensor_window: sensorWindow,
        car_id: selectedCar,
      };

      console.log('Sending prediction request:', {
        timesteps: request.sensor_window.length,
        features_per_timestep: request.sensor_window[0]?.length,
        car_id: request.car_id,
      });

      const response = await apuApi.predictAPU(request);

      console.log('Prediction response:', response);

      // Update car with prediction
      const updatedCars = metroCars.map(car => {
        if (car.id === selectedCar) {
          return {
            ...car,
            rul: response.rul_hours,
            status: response.severity === 'CRITICAL' ? 'Critical' as const : 
                   response.severity === 'WARNING' ? 'Warning' as const : 'Normal' as const,
            confidence: response.confidence * 100,
          };
        }
        return car;
      });

      setMetroCars(updatedCars);
      setLastInference(new Date().toLocaleTimeString());
      console.log('Prediction successful, car updated');
    } catch (error) {
      console.error('Prediction error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to run prediction: ${errorMessage}\n\nMake sure:\n1. Backend is running on port 8001\n2. Network is accessible\n3. Check browser console for details`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fleet statistics
  const totalCars = metroCars.length;
  const criticalCars = metroCars.filter(c => c.status === 'Critical').length;
  const warningCars = metroCars.filter(c => c.status === 'Warning').length;
  const normalCars = metroCars.filter(c => c.status === 'Normal').length;
  const avgRUL = (metroCars.reduce((sum, car) => sum + car.rul, 0) / totalCars).toFixed(1);

  // Calculate fleet average metrics from sensor data
  const calculateFleetMetrics = () => {
    const sensorKeys = Object.keys(metroCars[0].sensors);
    const metrics: { [key: string]: number } = {};
    
    sensorKeys.forEach(key => {
      const avg = metroCars.reduce((sum, car) => sum + car.sensors[key], 0) / totalCars;
      metrics[key] = avg;
    });

    return {
      loadCondition: (metrics.compressor_pressure * 100).toFixed(1),
      thermalStress: (metrics.oil_temperature * 100).toFixed(1),
      pressureBehavior: (metrics.pressure_gradient * 100).toFixed(1),
      operationalIntensity: (metrics.motor_current * 100).toFixed(1),
    };
  };

  const fleetMetrics = calculateFleetMetrics();

  return (
    <div className="apu-dashboard">
      {/* Sidebar */}
      <div className="apu-sidebar">
        <div className="apu-sidebar-header">
          <div className="apu-sidebar-icon">
            <Activity size={24} />
          </div>
          <div className="apu-sidebar-title">
            <div className="apu-sidebar-name">APU Sensor Input</div>
            <div className="apu-sidebar-subtitle">15 GRU Model Features</div>
          </div>
          <button className="apu-sidebar-back" onClick={() => navigate('/')}>
            ←
          </button>
        </div>

        {/* Metro Cars Tabs */}
        <div className="metro-cars-section">
          <div className="metro-cars-header">
            <span>METRO CARS</span>
            <button className="btn-add-car">
              <Plus size={16} />
            </button>
          </div>
          <div className="metro-cars-tabs">
            {metroCars.map((car) => (
              <button
                key={car.id}
                className={`metro-car-tab ${selectedCar === car.id ? 'active' : ''} ${car.status.toLowerCase()}`}
                onClick={() => setSelectedCar(car.id)}
              >
                {car.name}
                {car.status === 'Critical' && <span className="car-status-badge">⚠</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="apu-sidebar-actions">
          <button className="btn-sidebar" onClick={handleReset}>
            <RefreshCw size={16} />
            Reset
          </button>
          <button className="btn-sidebar" onClick={handleRandom}>
            <Shuffle size={16} />
            Random
          </button>
        </div>

        {/* Sensors List */}
        <div className="apu-sensors-list">
          <div className="sensor-card">
            <div className="sensor-header">
              <span className="sensor-number">1</span>
              <div className="sensor-info">
                <div className="sensor-name">{selectedCarData.name} APU Sensors</div>
                <div className="sensor-subtitle">15 GRU Model Input Features</div>
              </div>
              <span className={`sensor-status-badge ${selectedCarData.status.toLowerCase()}`}>
                {selectedCarData.status}
              </span>
            </div>
          </div>

          {Object.entries(selectedCarData.sensors).slice(0, 10).map(([key, value], index) => (
            <div key={key} className="sensor-slider">
              <div className="sensor-slider-header">
                <span className="sensor-slider-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="sensor-slider-icon">{getSensorIcon(key)}</span>
                <div className="sensor-slider-info">
                  <div className="sensor-slider-name">{getSensorDisplayName(key)}</div>
                  <div className="sensor-slider-unit">{getSensorUnit(key)}</div>
                </div>
                <span className={`sensor-slider-status ${value > 0.7 ? 'critical' : value > 0.5 ? 'high' : ''}`}>
                  {value > 0.7 ? 'Critical' : value > 0.5 ? 'High' : ''}
                </span>
                <span className="sensor-slider-value">{value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => handleSensorChange(key, parseFloat(e.target.value))}
                className={`slider ${value > 0.7 ? 'critical' : value > 0.5 ? 'warning' : 'normal'}`}
              />
            </div>
          ))}

          <div className="sensor-info-footer">
            <div className="sensor-info-row">
              <span className="sensor-info-label">Input Window</span>
              <span className="sensor-info-value">180 seconds</span>
            </div>
            <div className="sensor-info-row">
              <span className="sensor-info-label">Features per car</span>
              <span className="sensor-info-value">15 sensors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="apu-main-content">
        {/* Header */}
        <header className="apu-header">
          <div className="apu-header-left">
            <div className="apu-header-icon">
              <Activity size={24} />
            </div>
            <div className="apu-header-info">
              <h1 className="apu-header-title">Metro APU Dashboard</h1>
              <p className="apu-header-subtitle">Air Production Unit Predictive Maintenance</p>
            </div>
          </div>
          <div className="apu-header-right">
            <button className="apu-home-btn" onClick={() => navigate('/')}>
              <Home size={16} />
              Back to Home
            </button>
            <div className="apu-model-status">
              <Activity size={16} className="pulse" />
              <span className="model-status-text">GRU Model Active</span>
            </div>
            <div className="apu-last-inference">
              <span className="inference-label">Last inference:</span>
              <span className="inference-time">{lastInference}</span>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="apu-nav-tabs">
          <button
            className={`apu-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Grid size={16} />
            Overview
          </button>
          <button
            className={`apu-nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={16} />
            History
          </button>
          <button
            className={`apu-nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            Reports
          </button>
          <button
            className={`apu-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="apu-content">
            {/* Fleet Status Cards */}
            <div className="fleet-status-section">
              <div className="section-header">
                <Activity size={20} />
                <h2>Fleet APU Status</h2>
              </div>
              <div className="fleet-status-grid">
                <div className="fleet-stat-card">
                  <Grid size={32} className="stat-icon" />
                  <div className="stat-content">
                    <div className="stat-label">Total Cars</div>
                    <div className="stat-value">{totalCars}</div>
                  </div>
                </div>
                <div className="fleet-stat-card critical">
                  <AlertTriangle size={32} className="stat-icon" />
                  <div className="stat-content">
                    <div className="stat-label">Critical APUs</div>
                    <div className="stat-value">{criticalCars}</div>
                    <div className="stat-sublabel">Immediate action needed</div>
                  </div>
                </div>
                <div className="fleet-stat-card">
                  <Clock size={32} className="stat-icon" />
                  <div className="stat-content">
                    <div className="stat-label">Avg. RUL</div>
                    <div className="stat-value">{avgRUL}h</div>
                    <div className="stat-sublabel">Remaining useful life</div>
                  </div>
                </div>
                <div className="fleet-stat-card success">
                  <CheckCircle size={32} className="stat-icon" />
                  <div className="stat-content">
                    <div className="stat-label">Healthy APUs</div>
                    <div className="stat-value">{normalCars}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Twin Visualization */}
            <div className="digital-twin-section">
              <div className="section-header">
                <Activity size={20} />
                <h2>Metro Train Digital Twin</h2>
                <span className="section-subtitle">Hover over cars to see details</span>
              </div>
              <div className="digital-twin-grid">
                {metroCars.map((car) => (
                  <div
                    key={car.id}
                    className={`digital-twin-car ${car.status.toLowerCase()}`}
                    onClick={() => setSelectedCar(car.id)}
                  >
                    <div className="car-indicator"></div>
                    <div className="car-indicator"></div>
                    <div className="car-indicator"></div>
                    <div className="car-tooltip">
                      <div className="tooltip-header">{car.name}</div>
                      <div className="tooltip-rul">RUL: {car.rul.toFixed(1)}h</div>
                      <div className="tooltip-status">{car.status}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="visualization-buttons">
                <a 
                  href="/apu-visualization.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-visualization"
                >
                  View 3D Visualization
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* AI Fleet Assessment */}
            <div className="ai-assessment-section">
              <div className="section-header">
                <TrendingUp size={20} />
                <h2>AI Fleet Assessment</h2>
                <span className="section-badge">GRU Model Analysis</span>
              </div>
              <div className="assessment-grid">
                <div className="assessment-card">
                  <div className="assessment-icon info">ℹ️</div>
                  <div className="assessment-content">
                    <div className="assessment-label">Fleet Health Status</div>
                    <div className={`assessment-value ${criticalCars > 0 ? 'critical' : 'normal'}`}>
                      {criticalCars > 0 ? 'Critical' : warningCars > 0 ? 'Warning' : 'Normal'}
                    </div>
                    <div className="assessment-detail">
                      {normalCars} Normal • {warningCars} Warning • {criticalCars} Critical
                    </div>
                  </div>
                </div>
                <div className="assessment-card">
                  <div className="assessment-icon time">⏱️</div>
                  <div className="assessment-content">
                    <div className="assessment-label">Average Remaining Useful Life</div>
                    <div className="assessment-value success">{avgRUL} hours</div>
                    <div className="assessment-detail">Across all {totalCars} metro cars</div>
                  </div>
                </div>
                <div className="assessment-card">
                  <div className="assessment-icon alert">⚠️</div>
                  <div className="assessment-content">
                    <div className="assessment-label">Primary Degradation Factor</div>
                    <div className="assessment-value warning">Thermal Stress</div>
                    <div className="assessment-detail">Most common limiting factor in fleet</div>
                  </div>
                </div>
              </div>

              <div className="ai-recommendations">
                <h3>AI Recommendations</h3>
                <ul>
                  {criticalCars > 0 && (
                    <li className="recommendation critical">
                      <span>→</span> {criticalCars} APU(s) require immediate inspection and potential replacement
                    </li>
                  )}
                  {warningCars > 0 && (
                    <li className="recommendation warning">
                      <span>→</span> {warningCars} APU(s) showing elevated stress - schedule preventive maintenance
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* APU Assessment Details Table */}
            <div className="apu-details-section">
              <div className="section-header">
                <FileText size={20} />
                <h2>APU Assessment Details</h2>
                <span className="section-badge">15 sensor features • GRU model</span>
              </div>
              <div className="apu-details-table">
                <table>
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>⏱️ RUL</th>
                      <th>Status</th>
                      <th>Confidence</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metroCars.map((car) => (
                      <tr key={car.id} onClick={() => setSelectedCar(car.id)}>
                        <td>
                          <div className="car-cell">
                            <span className={`car-status-dot ${car.status.toLowerCase()}`}></span>
                            {car.name}
                          </div>
                        </td>
                        <td className={`rul-cell ${car.status.toLowerCase()}`}>
                          {car.rul.toFixed(1)} h
                        </td>
                        <td>
                          <span className={`status-badge ${car.status.toLowerCase()}`}>
                            {car.status}
                          </span>
                        </td>
                        <td>
                          <div className="confidence-cell">
                            <div className="confidence-bar">
                              <div
                                className="confidence-fill"
                                style={{ width: `${car.confidence}%` }}
                              ></div>
                            </div>
                            <span className="confidence-value">{car.confidence.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn-details">
                            <ChevronDown size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Predict Button */}
            <div className="predict-section">
              <button 
                className="btn-predict" 
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="spinning" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp size={20} />
                    Run Prediction for {selectedCarData.name}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="apu-content">
            <div className="history-section">
              <div className="section-header">
                <Clock size={20} />
                <h2>APU Maintenance History</h2>
              </div>
              <div className="history-list">
                {maintenanceHistory.map((item, index) => (
                  <div key={index} className={`history-item ${item.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="history-icon">
                      {item.status === 'Completed' && <CheckCircle size={24} />}
                      {item.status === 'In Progress' && <Activity size={24} />}
                      {item.status === 'Scheduled' && <Clock size={24} />}
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-car">{item.car_name}</span>
                        <span className="history-dot">•</span>
                        <span className="history-type">{item.maintenance_type}</span>
                      </div>
                      <div className="history-date">{item.date}</div>
                    </div>
                    <div className="history-rul">
                      <div className="rul-change-label">RUL Change</div>
                      <div className="rul-change-value">
                        {item.rul_before}h → {item.rul_after}h
                      </div>
                    </div>
                    <div className="history-status">
                      <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="apu-content">
            <div className="reports-section">
              <div className="section-header">
                <FileText size={20} />
                <h2>APU Analytics & Reports</h2>
              </div>
              <div className="reports-grid">
                <div className="report-card">
                  <h3>Fleet Status Distribution</h3>
                  <div className="distribution-list">
                    <div className="distribution-item">
                      <span className="distribution-label">Normal</span>
                      <div className="distribution-bar">
                        <div className="distribution-fill normal" style={{ width: `${(normalCars / totalCars) * 100}%` }}></div>
                      </div>
                      <span className="distribution-value">{normalCars} ({Math.round((normalCars / totalCars) * 100)}%)</span>
                    </div>
                    <div className="distribution-item">
                      <span className="distribution-label">Warning</span>
                      <div className="distribution-bar">
                        <div className="distribution-fill warning" style={{ width: `${(warningCars / totalCars) * 100}%` }}></div>
                      </div>
                      <span className="distribution-value">{warningCars} ({Math.round((warningCars / totalCars) * 100)}%)</span>
                    </div>
                    <div className="distribution-item">
                      <span className="distribution-label">Critical</span>
                      <div className="distribution-bar">
                        <div className="distribution-fill critical" style={{ width: `${(criticalCars / totalCars) * 100}%` }}></div>
                      </div>
                      <span className="distribution-value">{criticalCars} ({Math.round((criticalCars / totalCars) * 100)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="report-card">
                  <h3>Fleet Average Metrics</h3>
                  <div className="metrics-list">
                    <div className="metric-item">
                      <span className="metric-label">Load Condition</span>
                      <span className="metric-value">{fleetMetrics.loadCondition}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Thermal Stress</span>
                      <span className="metric-value">{fleetMetrics.thermalStress}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Pressure Behavior</span>
                      <span className="metric-value">{fleetMetrics.pressureBehavior}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Operational Intensity</span>
                      <span className="metric-value">{fleetMetrics.operationalIntensity}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-card full-width">
                <h3>RUL Distribution by Car</h3>
                <div className="rul-chart">
                  {metroCars.map((car) => (
                    <div key={car.id} className="rul-bar-item">
                      <span className="rul-bar-label">{car.name}</span>
                      <div className="rul-bar-container">
                        <div 
                          className={`rul-bar-fill ${car.status.toLowerCase()}`}
                          style={{ width: `${Math.min((car.rul / 500) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="rul-bar-value">{car.rul.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="apu-content">
            <div className="settings-section">
              <div className="settings-grid">
                <div className="settings-card">
                  <div className="settings-header">
                    <Activity size={20} />
                    <h3>Notifications</h3>
                  </div>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Critical Alerts</div>
                        <div className="setting-description">Get notified when APU reaches critical status</div>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Warning Alerts</div>
                        <div className="setting-description">Notify when RUL drops below warning threshold</div>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Maintenance Reminders</div>
                        <div className="setting-description">Scheduled maintenance notifications</div>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <RefreshCw size={20} />
                    <h3>Data Refresh</h3>
                  </div>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Auto Refresh</div>
                        <div className="setting-description">Automatically refresh APU data</div>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Refresh Interval</div>
                        <div className="setting-description">30s</div>
                      </div>
                      <input type="range" min="10" max="300" defaultValue="30" className="settings-slider" />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <Activity size={20} />
                    <h3>GRU Model Configuration</h3>
                  </div>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Critical RUL Threshold</div>
                        <div className="setting-description">≤ 80h</div>
                      </div>
                      <input type="range" min="10" max="200" defaultValue="80" className="settings-slider critical" />
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Warning RUL Threshold</div>
                        <div className="setting-description">≤ 320h</div>
                      </div>
                      <input type="range" min="50" max="500" defaultValue="320" className="settings-slider warning" />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-header">
                    <Activity size={20} />
                    <h3>Confidence Settings</h3>
                  </div>
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-label">Minimum Confidence Level</div>
                        <div className="setting-description">60%</div>
                      </div>
                      <input type="range" min="0" max="100" defaultValue="60" className="settings-slider" />
                    </div>
                    <div className="setting-item">
                      <div className="setting-info">
                        <div className="setting-description">Predictions below this confidence will be flagged</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APUDashboard;
