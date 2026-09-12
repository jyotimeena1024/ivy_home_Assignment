import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Key, Building2, Heart, BarChart3, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.25rem'
      }}>
        {/* Brand Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Home size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#fff' }}>
              Ivy<span className="gradient-text">Homes</span>
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Bangalore &bull; Indiranagar
            </div>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NavLink
            to="/listings"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            <Home size={16} />
            Listings
          </NavLink>
          <NavLink
            to="/rentals"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            <Key size={16} />
            Rentals
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            <Building2 size={16} />
            Projects
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            <Heart size={16} />
            Saved
          </NavLink>
          <NavLink
            to="/insights"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          >
            <BarChart3 size={16} />
            Insights
          </NavLink>
        </nav>

        {/* User Account / Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.84375rem'
              }}>
                <User size={15} color="var(--accent-secondary)" />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user?.email || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                title="Logout"
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Sparkles size={16} />
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
