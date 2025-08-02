import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Si usas react-hot-toast
import '../App.css';

function Login({ setIsAuthenticated, setEsVendedor }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        toast.error('Usuario o contraseña incorrectos');
        return;
      }

      const data = await res.json();

      // Guardar el flag como string 'true' o 'false' para evitar problemas de comparación
      localStorage.setItem('token', data.access);
      localStorage.setItem('usuario', username);
      localStorage.setItem('es_vendedor', data.es_vendedor === true || data.es_vendedor === 'true' ? 'true' : 'false');
      setIsAuthenticated(true);
      setEsVendedor(data.es_vendedor === true || data.es_vendedor === 'true');
      toast.success('Bienvenido');
      navigate('/'); // Redirigir siempre al inicio
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f7f9fa 60%, #eaf1ff 100%)',
      padding: '32px 0'
    }}>
      <div className="auth-form" style={{
        boxShadow: '0 8px 32px #2563eb22',
        borderRadius: 18,
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        minWidth: 340,
        background: '#fff',
        border: '1.5px solid #e3eafe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 18,
          color: '#2563eb',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 0.5
        }}>Acceso</h2>
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ marginBottom: 16, fontSize: 16, borderRadius: 8, border: '1.5px solid #cfd8dc', padding: '0.9rem', background: '#f7f9fa', outline: 'none', transition: 'border 0.2s' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginBottom: 18, fontSize: 16, borderRadius: 8, border: '1.5px solid #cfd8dc', padding: '0.9rem', background: '#f7f9fa', outline: 'none', transition: 'border 0.2s' }}
          />
          <button type="submit" style={{
            background: 'linear-gradient(90deg, #ff6a00 60%, #ff9800 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.95rem 0',
            fontWeight: 700,
            fontSize: 18,
            marginTop: 6,
            marginBottom: 2,
            boxShadow: '0 2px 8px #ff6a0033',
            cursor: 'pointer',
            transition: 'background 0.18s, transform 0.12s',
            letterSpacing: 0.5
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
