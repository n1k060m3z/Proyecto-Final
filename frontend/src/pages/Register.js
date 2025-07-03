import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../App.css'; // Usamos tus estilos personalizados

const Register = () => {
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
    <div className="auth-form">
      <h2>Registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="es_vendedor"
            checked={formData.es_vendedor}
            onChange={handleChange}
          />
          ¿Deseas registrarte como vendedor?
        </label>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
