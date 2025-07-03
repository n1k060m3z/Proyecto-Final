import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Si usas react-hot-toast
import '../App.css';

function Login() {
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

      localStorage.setItem('token', data.access);
      localStorage.setItem('usuario', username);
      localStorage.setItem('es_vendedor', data.es_vendedor);

      toast.success('Bienvenido');

      // Redirigir según rol
      if (data.es_vendedor) {
        navigate('/vendedor');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    }
  };

  return (
    <div className="auth-form">
      <h2>Acceso</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
