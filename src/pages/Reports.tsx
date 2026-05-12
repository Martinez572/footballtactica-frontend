import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Report { id: string; analysisType: string; summary: string; content: string; createdAt: string; }
interface Player { id: string; name: string; }

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [description, setDescription] = useState('');
  const [analysisType, setAnalysisType] = useState('TACTIC');
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadReports(); loadPlayers(); }, []);

  const loadReports = async () => {
    try {
      const response = await api.get(`/api/v1/reports/user/${user?.userId}`);
      setReports(response.data);
    } catch (error) { console.error(error); }
  };

  const loadPlayers = async () => {
    try {
      const response = await api.get(`/api/v1/players/user/${user?.userId}`);
      setPlayers(response.data);
      if (response.data.length > 0) setPlayerId(response.data[0].id);
    } catch (error) { console.error(error); }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      if (analysisType === 'TACTIC') {
        await api.post(`/api/v1/reports/tactic/${user?.userId}`, { description });
      } else {
        await api.post(`/api/v1/reports/player/${user?.userId}/${playerId}`, { description });
      }
      setDescription('');
      loadReports();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #21262d', background: '#0d1117', color: 'white', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '32px', color: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>🤖 Análisis IA</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Reportes tácticos generados con Gemini AI</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h3 style={{ color: '#ff6b9d', marginBottom: '16px' }}>Generar análisis</h3>
          <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '12px' }}>
            <select style={inputStyle} value={analysisType} onChange={e => setAnalysisType(e.target.value)}>
              <option value="TACTIC">Análisis de táctica</option>
              <option value="PLAYER">Análisis de jugador</option>
            </select>
            {analysisType === 'PLAYER' && players.length > 0 && (
              <select style={inputStyle} value={playerId} onChange={e => setPlayerId(e.target.value)}>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <textarea
              style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
              placeholder={analysisType === 'TACTIC' ? 'Describe la táctica...' : 'Describe al jugador...'}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <button onClick={generateReport} disabled={loading || !description}
              style={{ width: '100%', padding: '12px', background: loading ? '#333' : '#ff6b9d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '🤖 Analizando...' : '🤖 Generar análisis'}
            </button>
          </div>

          {selectedReport && (
            <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '12px', marginTop: '16px' }}>
              <h4 style={{ color: '#ff6b9d', marginBottom: '12px' }}>Reporte completo</h4>
              <p style={{ color: '#c9d1d9', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{selectedReport.content}</p>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ color: '#ff6b9d', marginBottom: '16px' }}>Reportes anteriores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.length === 0 && <p style={{ color: '#6b7280' }}>No hay reportes aún.</p>}
            {reports.map(report => (
              <div key={report.id} onClick={() => setSelectedReport(report)}
                style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '16px', cursor: 'pointer', borderLeft: '4px solid #ff6b9d' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6b9d'}
              >
                <p style={{ color: '#ff6b9d', margin: '0 0 8px', fontWeight: 'bold', fontSize: '13px' }}>
                  {report.analysisType === 'TACTIC' ? '📋 Análisis de táctica' : '👤 Análisis de jugador'}
                </p>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>{report.summary?.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;