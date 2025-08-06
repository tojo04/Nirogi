import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticlesBackground from './components/ParticlesBackground';
import HomePage from './pages/HomePage';
import ComparePage from './pages/ComparePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PharmaciesPage from './pages/PharmaciesPage';
import MedicationsPage from './pages/MedicationsPage';

function App() {
  const location = useLocation();

  // Determine if particles should be active (e.g., only on homepage or specific pages)
  const showParticles = location.pathname === '/';

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {showParticles && <ParticlesBackground />}
        <Header />
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
