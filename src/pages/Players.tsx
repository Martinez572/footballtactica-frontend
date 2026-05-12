import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  age: number;
  nationality: string;
}

const Players: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');
  const [age, setAge] = useState('');
  const [nationality, setNationality] = useState('');

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    try {
      const response = await api.get(`/api/v1/players/user/${user?.userId}`);
      setPlayers(response.data);
    } catch (error) { console.error(error); }
  };

  const createPlayer = async () => {
    try {
      await api.post('/api/v1/players', {
        userId: user?.userId, name, number: parseInt(number),
        position, age: parseInt(age), nationality
      });
      setShowForm(false);
      setName(''); setNumber(''); setPosition(''); setAge(''); setNationality('');
      loadPlayers();
    } catch (error) { console.error(error); }
  };

  const deletePlayer = async (id: string) => {
    await api.delete(`/api/v1/players/${id}`);
    loadPlayers();
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #21262d', background: '#0d1117', color: 'white', boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '32px', color: 'white' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>👥 Jugadores</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Gestiona la plantilla de tu equipo</p>
      </div>

      <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#00ff88', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px' }}>
        {showForm ? 'Cancelar' : '+ Agregar jugador'}
      </button>

      {showForm && (
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '12px', marginBottom: '24px', maxWidth: '400px' }}>
          <input style={inputStyle} placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <input style={inputStyle} placeholder="Número" type="number" value={number} onChange={e => setNumber(e.target.value)} />
          <input style={inputStyle} placeholder="Posición (ej: Delantero)" value={position} onChange={e => setPosition(e.target.value)} />
          <input style={inputStyle} placeholder="Edad" type="number" value={age} onChange={e => setAge(e.target.value)} />
          <input style={inputStyle} placeholder="Nacionalidad" value={nationality} onChange={e => setNationality(e.target.value)} />
          <button onClick={createPlayer} style={{ width: '100%', padding: '12px', background: '#00ff88', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar jugador
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {players.length === 0 && <p style={{ color: '#6b7280' }}>No hay jugadores aún.</p>}
        {players.map(player => (
          <div key={player.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #00ff88' }}>
            <h3 style={{ color: '#00ff88', margin: '0 0 8px' }}>#{player.number} {player.name}</h3>
            <p style={{ color: '#8b949e', margin: '4px 0' }}>📍 {player.position}</p>
            <p style={{ color: '#8b949e', margin: '4px 0' }}>🎂 {player.age} años</p>
            <p style={{ color: '#8b949e', margin: '4px 0' }}>🌍 {player.nationality}</p>
            <button onClick={() => deletePlayer(player.id)} style={{ marginTop: '12px', padding: '6px 12px', background: '#ff4444', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Players;