import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeters } from '../services/api';

function Dashboard() {
  const [meters, setMeters] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [search, setSearch] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeters(currentSearch, pagination.currentPage);
    // eslint-disable-next-line
  }, [pagination.currentPage, currentSearch]);

  const fetchMeters = async (searchStr, pageNum) => {
    setLoading(true);
    setError('');
    try {
      const data = await getMeters(searchStr, pageNum);
      setMeters(data.meters || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        totalCount: data.pagination?.totalCount || 0
      });
    } catch (err) {
      setError('Failed to fetch meters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setCurrentSearch(search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="container">
      <h2>Meters Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSearchSubmit} className="search-container">
        <input
          type="text"
          placeholder="Search by Meter ID, Serial No, Make, or DT Code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn" disabled={loading}>
          Search
        </button>
      </form>

      <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>
        Total Meters Found: {pagination.totalCount}
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading meters list...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Meter</th>
                <th>Serial</th>
                <th>Make</th>
                <th>Phase</th>
                <th>Status</th>
                <th>DT</th>
              </tr>
            </thead>
            <tbody>
              {meters.length > 0 ? (
                meters.map((meter) => (
                  <tr key={meter.meterId}>
                    <td>
                      <Link to={`/meters/${meter.meterId}`} style={{ fontWeight: 'bold', color: '#3498db' }}>
                        {meter.meterId}
                      </Link>
                    </td>
                    <td>{meter.serialNo}</td>
                    <td>{meter.make}</td>
                    <td>{meter.phaseType}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: meter.installStatus === 'Active' ? '#d4efdf' : '#fadbd8',
                        color: meter.installStatus === 'Active' ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {meter.installStatus}
                      </span>
                    </td>
                    <td>{meter.dtCode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No meters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
