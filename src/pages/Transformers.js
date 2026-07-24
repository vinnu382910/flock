import React, { useState, useEffect } from 'react';
import { getTransformers, getTransformerDetails, exportMeters } from '../services/api';

function Transformers() {
  const [transformers, setTransformers] = useState([]);
  const [selectedTransformer, setSelectedTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransformers();
  }, []);

  const fetchTransformers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTransformers();
      setTransformers(data || []);
    } catch (err) {
      setError('Failed to fetch transformers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransformer = async (code) => {
    setDetailsLoading(true);
    try {
      const data = await getTransformerDetails(code);
      setSelectedTransformer(data);
    } catch (err) {
      alert(`Failed to fetch details for transformer: ${code}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const meters = await exportMeters();
      
      // Build CSV
      const headers = [
        'Meter ID', 'Serial No', 'Make', 'Phase', 'Status', 
        'Install Type', 'Build', 'DT Code', 'Lat', 'Lng', 
        'Zone', 'Circle', 'Division', 'Subdivision', 'Substation', 'Feeder', 'Transformer'
      ];
      
      const rows = meters.map(m => [
        m.meterId,
        m.serialNo,
        m.make,
        m.phaseType,
        m.installStatus,
        m.installType,
        m.build,
        m.dtCode,
        m.geo?.lat || '',
        m.geo?.lng || '',
        m.hierarchy?.zone || '',
        m.hierarchy?.circle || '',
        m.hierarchy?.division || '',
        m.hierarchy?.subdivision || '',
        m.hierarchy?.substation || '',
        m.hierarchy?.feeder || '',
        m.hierarchy?.transformer || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `meters_bulk_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export bulk meters.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Distribution Transformers</h2>
        <button className="btn" onClick={handleExportAll} disabled={exporting}>
          {exporting ? 'Exporting...' : '📥 Export All Meters'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading transformers list...</div>
      ) : (
        <div className="grid-2">
          {/* Transformers Table */}
          <div>
            <table>
              <thead>
                <tr>
                  <th>DT Code</th>
                  <th>Name</th>
                  <th>Feeder</th>
                  <th>Capacity (kVA)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transformers.map((dt) => (
                  <tr key={dt.dtCode}>
                    <td><strong>{dt.dtCode}</strong></td>
                    <td>{dt.name}</td>
                    <td>{dt.feeder}</td>
                    <td>{dt.capacity} kVA</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleSelectTransformer(dt.dtCode)}
                        disabled={detailsLoading}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Details Section */}
          <div>
            {detailsLoading ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
                Loading transformer details...
              </div>
            ) : selectedTransformer ? (
              <div className="card">
                <h3>Transformer Detail: {selectedTransformer.dtCode}</h3>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedTransformer.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DT Code</span>
                  <span className="detail-value">{selectedTransformer.dtCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Feeder</span>
                  <span className="detail-value">{selectedTransformer.feeder}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Capacity</span>
                  <span className="detail-value">{selectedTransformer.capacity} kVA</span>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ marginTop: '15px' }}
                  onClick={() => setSelectedTransformer(null)}
                >
                  Clear Details
                </button>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
                Select a transformer from the table to view its specifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Transformers;
