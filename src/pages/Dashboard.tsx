import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ players: 0, tactics: 0, plays: 0, reports: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [playersRes, tacticsRes, reportsRes] = await Promise.all([
        api.get(`/api/v1/players/user/${user?.userId}`),
        api.get(`/api/v1/tactics/user/${user?.userId}`),
        api.get(`/api/v1/reports/user/${user?.userId}`),
      ]);
      setStats({
        players: playersRes.data.length,
        tactics: tacticsRes.data.length,
        plays: 0,
        reports: reportsRes.data.length,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const cards = [
    { icon: '⚽', label: 'Pizarra Táctica', description: 'Diseña jugadas en la cancha', path: '/board', color: '#00d4ff', bg: '#00d4ff15' },
    { icon: '👥', label: 'Jugadores', description: `${stats.players} jugadores registrados`, path: '/players', color: '#00ff88', bg: '#00ff8815' },
    { icon: '📋', label: 'Tácticas', description: `${stats.tactics} tácticas creadas`, path: '/tactics', color: '#4a9eff', bg: '#4a9eff15' },
    { icon: '🎯', label: 'Jugadas', description: 'Biblioteca de jugadas', path: '/plays', color: '#ffd700', bg: '#ffd70015' },
    { icon: '🤖', label: 'Análisis IA', description: `${stats.reports} reportes generados`, path: '/reports', color: '#ff6b9d', bg: '#ff6b9d15' },
  ];

  return (
    <div style={{ padding: '32px', color: 'white' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' }}>
          Bienvenido, {user?.name} 👋
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Panel de control — FootballTacticIA</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Jugadores', value: stats.players, icon: '👥', color: '#00ff88' },
          { label: 'Tácticas', value: stats.tactics, icon: '📋', color: '#4a9eff' },
          { label: 'Reportes IA', value: stats.reports, icon: '🤖', color: '#ff6b9d' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#161b22',
            border: '1px solid #21262d',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '32px' }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <h2 style={{ fontSize: '18px', color: '#8b949e', marginBottom: '16px', fontWeight: '600' }}>Módulos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {cards.map((card) => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: card.bg,
              border: `1px solid ${card.color}33`,
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{card.icon}</span>
            <h3 style={{ color: card.color, margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>{card.label}</h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;