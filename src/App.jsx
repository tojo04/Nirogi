import React, { useState, createContext, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticlesBackground from './components/ParticlesBackground';
import HomePage from './pages/HomePage';
import ComparePage from './pages/ComparePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Create an Auth Context
export const AuthContext = createContext(null);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('patient'); // 'patient' or 'admin'
  const location = useLocation();

  const handleLogin = (role = 'patient') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('patient');
  };

  // Determine if particles should be active (e.g., only on homepage or specific pages)
  const showParticles = location.pathname === '/';

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, handleLogin, handleLogout }}>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {showParticles && <ParticlesBackground />}
        <Header />
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add other routes here as needed */}
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
