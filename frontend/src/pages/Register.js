import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../App.css'; // Usamos tus estilos personalizados

const Register = ({ setIsAuthenticated, setEsVendedor }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    es_vendedor: false,
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Usuario registrado con éxito');
        navigate('/iniciar-sesion');
      } else {
        setError(data.error || 'Error en el registro');
        toast.error(data.error || 'Error en el registro');
      }
    } catch (err) {
      setError('Error en el servidor');
      toast.error('Error en el servidor');
      console.error('Error en el servidor:', err);
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
        }}>Registro</h2>
        {error && <div style={{ color: '#e53935', background: '#ffeaea', borderRadius: 8, padding: '8px 0', width: '100%', textAlign: 'center', marginBottom: 10, fontWeight: 500 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ marginBottom: 16, fontSize: 16, borderRadius: 8, border: '1.5px solid #cfd8dc', padding: '0.9rem', background: '#f7f9fa', outline: 'none', transition: 'border 0.2s' }}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ marginBottom: 16, fontSize: 16, borderRadius: 8, border: '1.5px solid #cfd8dc', padding: '0.9rem', background: '#f7f9fa', outline: 'none', transition: 'border 0.2s' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ marginBottom: 18, fontSize: 16, borderRadius: 8, border: '1.5px solid #cfd8dc', padding: '0.9rem', background: '#f7f9fa', outline: 'none', transition: 'border 0.2s' }}
          />
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 15,
            color: '#2563eb',
            fontWeight: 500,
            marginBottom: 18,
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              name="es_vendedor"
              checked={formData.es_vendedor}
              onChange={handleChange}
              style={{ accentColor: '#2563eb', width: 18, height: 18, marginRight: 6 }}
            />
            ¿Deseas registrarte como vendedor?
          </label>
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
          >Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
