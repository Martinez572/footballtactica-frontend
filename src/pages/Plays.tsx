import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Tactic { id: string; name: string; }
interface Play { id: string; name: string; category: string; order: number; }

const Plays: React.FC = () => {
  const { user } = useAuth();
  const [plays, setPlays] = useState<Play[]>([]);
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ATAQUE');
  const [order, setOrder] = useState('1');
  const [tacticId, setTacticId] = useState('');

  useEffect(() => { loadTactics(); }, []);
  useEffect(() => { if (tacticId) loadPlays(); }, [tacticId]);

  const loadTactics = async () => {
    try {
      const response = await api.get(`/api/v1/tactics/user/${user?.userId}`);
      setTactics(response.data);
      if (response.data.length > 0) setTacticId(response.data[0].id);
    } catch (error) { console.error(error); }
  };

  const loadPlays = async () => {
    try {
      const response = await api.get(`/api/v1/plays/tactic/${tacticId}`);
      setPlays(response.data);
    } catch (error) { console.error(error); }
  };

  const createPlay = async () => {
    try {
      await api.post('/api/v1/plays', { tacticId, name, category, order: parseInt(order) });
      setShowForm(false);
      setName(''); setCategory('ATAQUE'); setOrder('1');
      loadPlays();
    } catch (error) { console.error(error); }
  };

  const deletePlay = async (id: string) => {
    await api.delete(`/api/v1/plays/${id}`);
    loadPlays();
  };

  const categoryColors: Record<string, string> = { ATAQUE: '#00ff88', DEFENSA: '#ff4444', BALON_PARADO: '#ffd700', TRANSICION: '#00d4ff' };
  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #21262d', background: '#0d1117', color: 'white', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '32px', color: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>🎯 Jugadas</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Biblioteca de jugadas por táctica</p>
      </div>

      {tactics.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Primero crea una táctica para agregar jugadas.</p>
      ) : (
        <>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ color: '#8b949e' }}>Táctica:</label>
            <select value={tacticId} onChange={e => setTacticId(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #21262d', background: '#161b22', color: 'white' }}>
              {tactics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: '#ffd700', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {showForm ? 'Cancelar' : '+ Nueva jugada'}
            </button>
          </div>

          {showForm && (
            <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '12px', marginBottom: '24px', maxWidth: '400px' }}>
              <input style={inputStyle} placeholder="Nombre de la jugada" value={name} onChange={e => setName(e.target.value)} />
              <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="ATAQUE">Ataque</option>
                <option value="DEFENSA">Defensa</option>
                <option value="BALON_PARADO">Balón parado</option>
                <option value="TRANSICION">Transición</option>
              </select>
              <input style={inputStyle} placeholder="Orden" type="number" value={order} onChange={e => setOrder(e.target.value)} />
              <button onClick={createPlay} style={{ width: '100%', padding: '12px', background: '#ffd700', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Guardar jugada
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {plays.length === 0 && <p style={{ color: '#6b7280' }}>No hay jugadas para esta táctica.</p>}
            {plays.map(play => (
              <div key={play.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${categoryColors[play.category] || '#00d4ff'}` }}>
                <h3 style={{ color: categoryColors[play.category] || '#00d4ff', margin: '0 0 8px' }}>#{play.order} {play.name}</h3>
                <p style={{ color: '#8b949e', margin: '4px 0' }}>📂 {play.category}</p>
                <button onClick={() => deletePlay(play.id)} style={{ marginTop: '12px', padding: '6px 12px', background: '#ff4444', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Plays;