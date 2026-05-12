import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '⚽', label: 'Pizarra Táctica', path: '/board' },
    { icon: '👥', label: 'Jugadores', path: '/players' },
    { icon: '📋', label: 'Tácticas', path: '/tactics' },
    { icon: '🎯', label: 'Jugadas', path: '/plays' },
    { icon: '🤖', label: 'Análisis IA', path: '/reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{
      width: collapsed ? '70px' : '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1b2a 100%)',
      borderRight: '1px solid #1e3a5f',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚽</span>
            <div>
              <div style={{ color: '#00d4ff', fontWeight: 'bold', fontSize: '14px' }}>FootballTactic</div>
              <div style={{ color: '#4a9eff', fontSize: '11px' }}>IA Platform</div>
            </div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: '24px', margin: '0 auto' }}>⚽</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '16px 8px' }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 12px',
              marginBottom: '4px',
              borderRadius: '10px',
              cursor: 'pointer',
              background: isActive(item.path) ? 'linear-gradient(90deg, #00d4ff22, #0066ff22)' : 'transparent',
              borderLeft: isActive(item.path) ? '3px solid #00d4ff' : '3px solid transparent',
              transition: 'all 0.2s',
              color: isActive(item.path) ? '#00d4ff' : '#8899aa',
            }}
            onMouseEnter={e => {
              if (!isActive(item.path)) e.currentTarget.style.background = '#ffffff11';
            }}
            onMouseLeave={e => {
              if (!isActive(item.path)) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: isActive(item.path) ? '600' : '400' }}>{item.label}</span>}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e3a5f' }}>
        {!collapsed && (
          <div style={{ marginBottom: '12px', padding: '12px', background: '#ffffff0a', borderRadius: '10px' }}>
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600' }}>{user?.name}</div>
            <div style={{ color: '#4a9eff', fontSize: '11px' }}>{user?.email}</div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            width: '100%',
            padding: '10px',
            background: '#ff4444',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          {collapsed ? '🚪' : '🚪 Cerrar sesión'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;