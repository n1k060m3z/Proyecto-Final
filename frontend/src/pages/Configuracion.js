import React, { useState } from 'react';

const Configuracion = () => {
  // Simulación de datos actuales
  const [form, setForm] = useState({
    usuario: localStorage.getItem('usuario') || '',
    email: localStorage.getItem('email') || '',
    password: '',
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Aquí deberías hacer la petición a la API para actualizar los datos
    setMensaje('Datos actualizados correctamente (simulado)');
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: '2rem auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h2 className="text-2xl font-bold mb-6">Configuración de cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nombre de usuario</label>
          <input name="usuario" value={form.usuario} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Correo electrónico</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nueva contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Guardar cambios</button>
      </form>
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
};

export default Configuracion;
