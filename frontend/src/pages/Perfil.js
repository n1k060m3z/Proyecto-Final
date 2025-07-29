import api from '../api/axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SidebarPerfil = ({ onSection }) => (
  <aside style={{ minWidth: 220, background: '#f6f8fa', borderRadius: 12, padding: 24, marginRight: 32, height: '100%' }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Mi cuenta</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="hover:underline text-left" onClick={() => onSection('perfil')}>Mi perfil</button>
      <button className="hover:underline text-left" onClick={() => onSection('configuracion')}>Configuración</button>
      <button className="hover:underline text-left" onClick={() => onSection('compras')}>Compras</button>
      <button className="hover:underline text-left" onClick={() => onSection('ventas')}>Ventas</button>
      <button className="hover:underline text-left" onClick={() => onSection('seguridad')}>Seguridad</button>
    </div>
  </aside>
);

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [section, setSection] = useState('perfil');
  const navigate = useNavigate();

  const recargarUsuario = () => {
    api.get('http://localhost:8000/api/perfil/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setUsuario(res.data))
      .catch(() => setUsuario(null));
  };

  useEffect(() => {
    recargarUsuario();
  }, []);

  if (!usuario) return <div className="container">Cargando perfil...</div>;

  return (
    <div className="container" style={{ maxWidth: 1100, margin: '2rem auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32, display: 'flex' }}>
      <SidebarPerfil onSection={setSection} />
      <div style={{ flex: 1 }}>
        {section === 'perfil' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Mi perfil</h2>
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ minWidth: 180, textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e3eafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: '#2563eb', margin: '0 auto 1rem' }}>
                  {usuario.username ? usuario.username[0].toUpperCase() : '?'}
                </div>
                <div className="font-semibold">{usuario.username}</div>
                <div className="text-gray-500 text-sm">{usuario.email || 'Sin email'}</div>
                <div className="mt-2 text-xs text-gray-600">{usuario.es_vendedor ? 'Vendedor' : 'Comprador'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="text-lg font-semibold mb-2">Información personal</h3>
                <div className="mb-4">Nombre de usuario: <b>{usuario.username}</b></div>
                <div className="mb-4">Correo electrónico: <b>{usuario.email || 'No disponible'}</b></div>
                <div className="mb-4">Rol: <b>{usuario.es_vendedor ? 'Vendedor' : 'Comprador'}</b></div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setSection('configuracion')}>
                  Configuración de cuenta
                </button>
              </div>
            </div>
          </>
        )}
        {section === 'configuracion' && (
          <Configuracion usuario={usuario} onUpdate={recargarUsuario} />
        )}
        {section === 'compras' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mis compras</h2>
            <div className="text-gray-500">(Aquí puedes mostrar el historial de compras del usuario)</div>
          </div>
        )}
        {section === 'ventas' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mis ventas</h2>
            <div className="text-gray-500">(Aquí puedes mostrar el historial de ventas del usuario si es vendedor)</div>
          </div>
        )}
        {section === 'seguridad' && (
          <CambioPassword />
        )}
      </div>
    </div>
  );
};

const Configuracion = ({ usuario, onUpdate }) => {
  const [form, setForm] = useState({
    username: usuario.username || '',
    email: usuario.email || '',
  });
  const [passwordActual, setPasswordActual] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    setForm({ username: usuario.username || '', email: usuario.email || '' });
  }, [usuario]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!passwordActual) {
      setMensaje('Debes ingresar tu contraseña actual para guardar los cambios');
      return;
    }
    try {
      await api.patch('http://localhost:8000/api/perfil/', { ...form, password_actual: passwordActual }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMensaje('Datos actualizados correctamente');
      setPasswordActual('');
      if (onUpdate) onUpdate();
    } catch {
      setMensaje('Error al actualizar los datos');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="text-2xl font-bold mb-6">Configuración de cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nombre de usuario</label>
          <input name="username" value={form.username} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Correo electrónico</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Contraseña actual <span style={{color:'red'}}>*</span></label>
          <input name="passwordActual" type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Guardar cambios</button>
      </form>
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
};

// --- Componente para cambio de contraseña seguro ---
const CambioPassword = () => {
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [autenticado, setAutenticado] = useState(false);

  const handleVerificar = async e => {
    e.preventDefault();
    // Verificar contraseña actual (puedes crear un endpoint o usar el de perfil con solo password_actual)
    try {
      await api.post('http://localhost:8000/api/perfil/verificar-password/', { password_actual: passwordActual }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAutenticado(true);
      setMensaje('Contraseña verificada. Ahora puedes cambiarla.');
    } catch {
      setMensaje('Contraseña actual incorrecta');
    }
  };

  const handleCambioPassword = async e => {
    e.preventDefault();
    try {
      await api.patch('http://localhost:8000/api/perfil/', { password: nuevaPassword, password_actual: passwordActual }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMensaje('Contraseña cambiada correctamente');
      setNuevaPassword('');
      setPasswordActual('');
      setAutenticado(false);
    } catch {
      setMensaje('Error al cambiar la contraseña');
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 className="text-2xl font-bold mb-6">Cambiar contraseña</h2>
      {!autenticado ? (
        <form onSubmit={handleVerificar}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Contraseña actual</label>
            <input name="passwordActual" type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Verificar</button>
        </form>
      ) : (
        <form onSubmit={handleCambioPassword}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Nueva contraseña</label>
            <input name="nuevaPassword" type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Cambiar contraseña</button>
        </form>
      )}
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
};

export default Perfil;
