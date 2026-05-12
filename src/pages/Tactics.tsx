import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Tactic {
  id: string;
  name: string;
  description: string;
  formation: string;
  state: string;
}

const Tactics: React.FC = () => {
  const { user } = useAuth();
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [state, setState] = useState('ATTACK');

  useEffect(() => { loadTactics(); }, []);

  const loadTactics = async () => {
    try {
      const response = await api.get(`/api/v1/tactics/user/${user?.userId}`);
      setTactics(response.data);
    } catch (error) { console.error(error); }
  };

  const createTactic = async () => {
    try {
      await api.post('/api/v1/tactics', { userId: user?.userId, name, description, formation, state });
      setShowForm(false);
      setName(''); setDescription(''); setFormation('4-3-3'); setState('ATTACK');
      loadTactics();
    } catch (error) { console.error(error); }
  };

  const deleteTactic = async (id: string) => {
    await api.delete(`/api/v1/tactics/${id}`);
    loadTactics();
  };

  const stateColors: Record<string, string> = { ATTACK: '#00ff88', DEFENSE: '#ff4444', SET_PIECE: '#ffd700', KICKOFF: '#00d4ff' };
  const stateLabels: Record<string, string> = { ATTACK: 'Ataque', DEFENSE: 'Defensa', SET_PIECE: 'Balón parado', KICKOFF: 'Salida' };
  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #21262d', background: '#0d1117', color: 'white', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '32px', color: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>📋 Tácticas</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Diseña y gestiona tus formaciones</p>
      </div>

      <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#4a9eff', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px' }}>
        {showForm ? 'Cancelar' : '+ Nueva táctica'}
      </button>

      {showForm && (
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '12px', marginBottom: '24px', maxWidth: '400px' }}>
          <input style={inputStyle} placeholder="Nombre de la táctica" value={name} onChange={e => setName(e.target.value)} />
          <input style={inputStyle} placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
          <select style={inputStyle} value={formation} onChange={e => setFormation(e.target.value)}>
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
          </select>
          <select style={inputStyle} value={state} onChange={e => setState(e.target.value)}>
            <option value="ATTACK">Ataque</option>
            <option value="DEFENSE">Defensa</option>
            <option value="SET_PIECE">Balón parado</option>
            <option value="KICKOFF">Salida</option>
          </select>
          <button onClick={createTactic} style={{ width: '100%', padding: '12px', background: '#4a9eff', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar táctica
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {tactics.length === 0 && <p style={{ color: '#6b7280' }}>No hay tácticas aún.</p>}
        {tactics.map(tactic => (
          <div key={tactic.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${stateColors[tactic.state]}` }}>
            <h3 style={{ color: stateColors[tactic.state], margin: '0 0 8px' }}>{tactic.name}</h3>
            <p style={{ color: '#8b949e', margin: '4px 0' }}>⚽ {tactic.formation}</p>
            <p style={{ color: '#8b949e', margin: '4px 0' }}>🎯 {stateLabels[tactic.state]}</p>
            {tactic.description && <p style={{ color: '#8b949e', margin: '4px 0', fontSize: '14px' }}>{tactic.description}</p>}
            <button onClick={() => deleteTactic(tactic.id)} style={{ marginTop: '12px', padding: '6px 12px', background: '#ff4444', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tactics;