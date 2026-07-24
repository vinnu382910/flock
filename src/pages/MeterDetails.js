import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeterDetails, getMeterLocation, getMeterEnergy } from '../services/api';

function MeterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meter, setMeter] = useState(null);
  const [location, setLocation] = useState(null);
  const [energy, setEnergy] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeterAllData();
    // eslint-disable-next-line
  }, [id]);

  const fetchMeterAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [detailsData, locationData, energyData] = await Promise.all([
        getMeterDetails(id),
        getMeterLocation(id),
        getMeterEnergy(id)
      ]);

      setMeter(detailsData);
      setLocation(locationData);
      setEnergy(energyData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch meter details. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Loading meter data...</div>;
  }

  if (error || !meter) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Meter not found.'}</div>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Meter Details: {meter.meterId}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="grid-2">
        {/* Basic Info */}
        <div className="card">
          <h3>Basic Information</h3>
          <div className="detail-row">
            <span className="detail-label">Meter ID</span>
            <span className="detail-value">{meter.meterId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Serial Number</span>
            <span className="detail-value">{meter.serialNo}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Make</span>
            <span className="detail-value">{meter.make}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phase Type</span>
            <span className="detail-value">{meter.phaseType}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Installation Status</span>
            <span className="detail-value" style={{ 
              fontWeight: 'bold', 
              color: meter.installStatus === 'Active' ? '#27ae60' : '#e74c3c' 
            }}>{meter.installStatus}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Installation Type</span>
            <span className="detail-value">{meter.installType}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Build / Complex</span>
            <span className="detail-value">{meter.build}</span>
          </div>
        </div>

        {/* Location & Network Hierarchy */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Geographic Coordinates</h3>
            <div className="detail-row">
              <span className="detail-label">Latitude</span>
              <span className="detail-value">{location?.lat || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Longitude</span>
              <span className="detail-value">{location?.lng || 'N/A'}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Network Hierarchy</h3>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', borderLeft: '3px solid #3498db', fontSize: '14px', lineHeight: '1.6' }}>
              <div><strong>Zone:</strong> {meter.hierarchy?.zone}</div>
              <div><strong>Circle:</strong> {meter.hierarchy?.circle}</div>
              <div><strong>Division:</strong> {meter.hierarchy?.division}</div>
              <div><strong>Subdivision:</strong> {meter.hierarchy?.subdivision}</div>
              <div><strong>Substation:</strong> {meter.hierarchy?.substation}</div>
              <div><strong>Feeder:</strong> {meter.hierarchy?.feeder}</div>
              <div><strong>Transformer (DT):</strong> {meter.hierarchy?.transformer}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Log Table */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Energy Readings (Recent Hourly Logs)</h3>
        {energy?.readings && energy.readings.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Active Energy (kWh)</th>
                  <th>Reactive Energy (kVARh)</th>
                  <th>Voltage (V)</th>
                  <th>Current (A)</th>
                </tr>
              </thead>
              <tbody>
                {energy.readings.map((reading, idx) => (
                  <tr key={idx}>
                    <td>{new Date(reading.timestamp).toLocaleString()}</td>
                    <td>{reading.activeEnergy}</td>
                    <td>{reading.reactiveEnergy}</td>
                    <td>{reading.voltage}</td>
                    <td>{reading.current}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No energy readings available.</div>
        )}
      </div>
    </div>
  );
}

export default MeterDetails;
