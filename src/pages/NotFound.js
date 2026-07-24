import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '100px', padding: '40px' }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#e74c3c' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn">
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
