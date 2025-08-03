import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App'; // Import AuthContext

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, handleLogout } = useContext(AuthContext); // Use AuthContext

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/compare?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative z-20 bg-surface/80 backdrop-blur-md shadow-lg py-4 px-6 md:px-12 flex items-center justify-between border-b border-border">
      <Link to="/" className="flex items-center space-x-3 group">
        <img src="/logo.svg" alt="Prescription Affordability Engine Logo" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-2xl font-bold text-text bg-clip-text text-transparent bg-gradient-to-r from-primary to-error transition-all duration-300 group-hover:from-error group-hover:to-primary">
          PrescribeWise
        </span>
      </Link>

      <form onSubmit={handleSearch} className="flex-grow max-w-xl mx-4 md:mx-8 relative">
        <input
          type="text"
          placeholder="Search for a drug (e.g., 'Lipitor', 'Amoxicillin')"
          className="input-field pl-12 pr-4 py-2 rounded-full bg-surface border border-border focus:border-primary focus:ring-primary transition-all duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      <nav className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn-secondary text-sm px-4 py-2">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-primary text-sm px-4 py-2">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">
              Login
            </Link>
            <Link to="/login" className="btn-primary text-sm px-4 py-2">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
