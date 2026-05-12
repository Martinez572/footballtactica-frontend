import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';      const body = isRegister ? { name, email, password } : { email, password };
      const response = await api.post(endpoint, body);
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a2e' }}>
      <div style={{ background: '#16213e', padding: '40px', borderRadius: '12px', width: '380px', color: 'white' }}>
        <h1 style={{ textAlign: 'center', color: '#00d4ff', marginBottom: '8px' }}>⚽ FootballTacticIA</h1>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '18px' }}>
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>

        {isRegister && (
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#0f3460', color: 'white', boxSizing: 'border-box' }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', background: '#0f3460', color: 'white', boxSizing: 'border-box' }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #444', background: '#0f3460', color: 'white', boxSizing: 'border-box' }}
        />

        {error && <p style={{ color: '#ff6b6b', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', color: '#aaa' }}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#00d4ff', cursor: 'pointer', marginLeft: '8px' }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;