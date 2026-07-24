import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { getSession, logout as apiLogout } from './services/api';
import './styles/app.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeterDetails from './pages/MeterDetails';
import Transformers from './pages/Transformers';
import Network from './pages/Network';
import NotFound from './pages/NotFound';

export const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const data = await getSession();
      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('flock_token');
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('flock_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
      setUser(null); // Force logout locally
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading application...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogout }}>
      <BrowserRouter>
        {user && (
          <header>
            <h1>⚡ Flock Energy Meter Portal</h1>
            <nav>
              <Link to="/">Dashboard</Link>
              <Link to="/transformers">Transformers</Link>
              <Link to="/network">Network</Link>
              <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout ({user.username})</a>
            </nav>
          </header>
        )}
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={checkSession} />} 
          />
          <Route 
            path="/" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/meters/:id" 
            element={user ? <MeterDetails /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/transformers" 
            element={user ? <Transformers /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/network" 
            element={user ? <Network /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
