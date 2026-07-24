import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNetwork } from '../services/api';

const TreeNode = ({ node }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      {hasChildren ? (
        <>
          <div className="tree-node-title" onClick={() => setExpanded(!expanded)}>
            <span>{expanded ? '📂' : '📁'}</span>
            <span style={{ marginRight: '5px' }}>{node.name}</span>
            <small style={{ color: '#95a5a6', fontWeight: 'normal', fontSize: '11px' }}>
              ({node.type})
            </small>
          </div>
          {expanded && (
            <div style={{ marginLeft: '10px' }}>
              {node.children.map((child, idx) => (
                <TreeNode key={idx} node={child} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="tree-leaf">
          {node.type === 'meter' ? (
            <Link to={`/meters/${node.meterId}`} style={{ color: '#2980b9', textDecoration: 'none' }}>
              ⚡ Meter: {node.name}
            </Link>
          ) : (
            <span>📄 {node.name}</span>
          )}
        </div>
      )}
    </div>
  );
};

function Network() {
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNetwork();
      setNetworkData(data || []);
    } catch (err) {
      setError('Failed to fetch network hierarchy tree.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Network Hierarchy Tree</h2>
      <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '20px' }}>
        Expand nodes below to explore the electricity distribution network hierarchy: Zone → Circle → Division → Subdivision → Substation → Feeder → DT → Meter.
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Building network tree...</div>
      ) : (
        <div style={{ background: '#fafafa', padding: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
          {networkData.length > 0 ? (
            networkData.map((zone, idx) => (
              <TreeNode key={idx} node={zone} />
            ))
          ) : (
            <div>No hierarchy data available.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Network;
