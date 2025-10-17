import api from '../api/axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ventas from '../components/Ventas';
import Estrellas from '../components/Estrellas';
import { getSolicitudesServicio } from '../api/ventas';
import { calcularNotificaciones } from '../api/notificaciones';
import { IoMdNotifications } from "react-icons/io";
import Select from 'react-select';

const SidebarPerfil = ({ onSection, esVendedor, notifs }) => (
  <aside style={{ minWidth: 220, background: '#f6f8fa', borderRadius: 12, padding: 24, marginRight: 32, height: '100%' }}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, display:'flex', alignItems:'center', gap:8 }}>
      Mi cuenta
      {notifs.perfil && <span style={{background:'#e53935',color:'#fff',borderRadius:'50%',padding:'0 7px',fontSize:13,fontWeight:700,marginLeft:4}}>•</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="hover:underline text-left" onClick={() => onSection('perfil')} style={{display:'flex',alignItems:'center',gap:6}}>
        Mi perfil {notifs.perfil && <IoMdNotifications style={{ color: '#ff0', fontSize: 18, marginLeft: 4, verticalAlign: 'middle' }} />}
      </button>
      <button className="hover:underline text-left" onClick={() => onSection('configuracion')}>Configuración</button>
      <button className="hover:underline text-left" onClick={() => onSection('compras')} style={{display:'flex',alignItems:'center',gap:6}}>
        Compras {notifs.compras && <IoMdNotifications style={{ color: '#ff0', fontSize: 18, marginLeft: 4, verticalAlign: 'middle' }} />}
      </button>
      {esVendedor && <button className="hover:underline text-left" onClick={() => onSection('ventas')} style={{display:'flex',alignItems:'center',gap:6}}>
        Ventas {notifs.ventas && <IoMdNotifications style={{ color: '#ff0', fontSize: 18, marginLeft: 4, verticalAlign: 'middle' }} />}
      </button>}
      {esVendedor && <button className="hover:underline text-left" onClick={() => onSection('perfil_ventas')}>Mi perfil de ventas</button>}
      <button className="hover:underline text-left" onClick={() => onSection('seguridad')}>Seguridad</button>
    </div>
  </aside>
);

const Perfil = ({ setNotifs: setNotifsGlobal }) => {
  const [usuario, setUsuario] = useState(null);
  const [section, setSection] = useState('perfil');
  const [notifs, setNotifs] = useState({ perfil: false, compras: false, ventas: false });
  const [ultimaNotif, setUltimaNotif] = useState(null); // Para comparar
  const navigate = useNavigate();

  // --- Utilidad para persistir la última notificación vista por usuario y sección ---
  const markNotificacionVista = (userId, notifKey, seccion) => {
    if (userId && notifKey && seccion) localStorage.setItem(`notificacionVista_${seccion}_${userId}`, notifKey);
  };
  const getNotificacionVista = (userId, seccion) => {
    return (userId && seccion) ? localStorage.getItem(`notificacionVista_${seccion}_${userId}`) : null;
  };

  const recargarUsuario = () => {
    api.get('http://localhost:8000/api/perfil/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setUsuario(res.data))
      .catch(() => setUsuario(null));
  };

  // Notificaciones de negociación y cambios de estado
  useEffect(() => {
    if (!usuario) return;
    getSolicitudesServicio().then(solicitudes => {
      let notifCompras = false, notifVentas = false;
      let notifKey = null;
      // Buscar la última solicitud relevante (por fecha o id mayor)
      const relevantes = solicitudes.filter(s =>
        (s.cliente === usuario.id || s.vendedor === usuario.id) &&
        ['pendiente','aceptado','rechazado','negociacion'].includes(s.estado)
      );
      if (relevantes.length > 0) {
        // Construir un identificador único para cada notificación relevante
        const ultima = relevantes.reduce((a, b) => (a.id > b.id ? a : b));
        notifKey = `sol-${ultima.id}-${ultima.estado}-${ultima.fecha_propuesta||''}-${ultima.hora_propuesta||''}`;
        notifCompras = relevantes.some(s => s.cliente === usuario.id);
        notifVentas = relevantes.some(s => s.vendedor === usuario.id);
      }
      setUltimaNotif(notifKey);
      // Solo mostrar viñeta si no ha sido vista esta notificación en esa sección
      const notiVistaCompras = getNotificacionVista(usuario.id, 'compras') === notifKey;
      const notiVistaVentas = getNotificacionVista(usuario.id, 'ventas') === notifKey;
      const notiVistaPerfil = getNotificacionVista(usuario.id, 'perfil') === notifKey;
      const newNotifs = {
        perfil: !!notifKey && !notiVistaPerfil,
        compras: notifCompras && !!notifKey && !notiVistaCompras,
        ventas: notifVentas && !!notifKey && !notiVistaVentas
      };
      setNotifs(newNotifs);
      if (setNotifsGlobal) setNotifsGlobal(newNotifs);
    });
  }, [usuario, setNotifsGlobal]);

  // Al abrir sección, quitar viñeta SOLO de esa sección y marcar como vista SOLO esa sección
  useEffect(() => {
    setNotifs(n => {
      let newNotifs = { ...n };
      if (section === 'compras') {
        newNotifs.compras = false;
        if (usuario && ultimaNotif) markNotificacionVista(usuario.id, ultimaNotif, 'compras');
      }
      if (section === 'ventas') {
        newNotifs.ventas = false;
        if (usuario && ultimaNotif) markNotificacionVista(usuario.id, ultimaNotif, 'ventas');
      }
      if (section === 'perfil') {
        newNotifs.perfil = false;
        if (usuario && ultimaNotif) markNotificacionVista(usuario.id, ultimaNotif, 'perfil');
      }
      // Forzar actualización global para sincronizar viñeta superior
      if (setNotifsGlobal) setNotifsGlobal({ ...newNotifs });
      // Recalcular notificaciones globales para App.js y Navbar
      if (usuario && setNotifsGlobal) {
        calcularNotificaciones(usuario).then(setNotifsGlobal);
      }
      return newNotifs;
    });
  }, [section, setNotifsGlobal, usuario, ultimaNotif]);

  useEffect(() => {
    recargarUsuario();
  }, []);

  if (!usuario) return <div className="container">Cargando perfil...</div>;

  return (
    <div className="container" style={{ maxWidth: 1100, margin: '2rem auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32, display: 'flex' }}>
      <SidebarPerfil onSection={setSection} esVendedor={usuario.es_vendedor} notifs={notifs} />
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
            <Ventas modoCompras usuario={usuario} setNotifsGlobal={setNotifsGlobal} />
          </div>
        )}
        {section === 'ventas' && usuario.es_vendedor && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mis ventas</h2>
            <Ventas usuario={usuario} setNotifsGlobal={setNotifsGlobal} />
          </div>
        )}
        {section === 'perfil_ventas' && usuario.es_vendedor && (
          <PerfilVentas usuario={usuario} onUpdate={recargarUsuario} />
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
    direccion: usuario.direccion || '',
    city: usuario.city || '',
  });
  const [passwordActual, setPasswordActual] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ciudades, setCiudades] = useState([]);
  const ciudadActual = ciudades.find(c => c.id === form.city) || null;

  useEffect(() => {
    setForm({
      username: usuario.username || '',
      email: usuario.email || '',
      direccion: usuario.direccion || '',
      city: usuario.city || '',
    });
  }, [usuario]);

  useEffect(() => {
    api.get('http://localhost:8000/api/ciudades/')
      .then(res => setCiudades(res.data))
      .catch(() => setCiudades([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCiudadChange = option => {
    setForm({ ...form, city: option ? option.id : '' });
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
          <label className="block mb-1 font-semibold">Dirección de entrega</label>
          <input name="direccion" value={form.direccion} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Ej: Calle 123 #45-67, Ciudad, Departamento" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Ciudad</label>
          <Select
            options={ciudades.map(c => ({ value: c.id, label: c.name, id: c.id }))}
            value={ciudadActual ? { value: ciudadActual.id, label: ciudadActual.name, id: ciudadActual.id } : null}
            onChange={handleCiudadChange}
            isClearable
            placeholder="Selecciona una ciudad..."
            styles={{
              control: (base) => ({ ...base, minHeight: 42, borderColor: '#cbd5e1', boxShadow: 'none' }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
              option: (base, state) => ({ ...base, color: state.isSelected ? '#fff' : '#222', backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#e3eafe' : '#fff' })
            }}
            noOptionsMessage={() => 'No hay ciudades'}
          />
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

  const passwordRequirements = [
    { label: 'Al menos 8 caracteres', test: p => p.length >= 8 },
    { label: 'Una letra mayúscula', test: p => /[A-Z]/.test(p) },
    { label: 'Una letra minúscula', test: p => /[a-z]/.test(p) },
    { label: 'Un número', test: p => /[0-9]/.test(p) },
    { label: 'Un carácter especial', test: p => /[^A-Za-z0-9]/.test(p) },
  ];
  const passwordValid = passwordRequirements.every(r => r.test(nuevaPassword));

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
    if (!passwordValid) {
      setMensaje('La nueva contraseña no cumple con los requisitos de seguridad.');
      return;
    }
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
            <ul style={{margin: '0 0 10px 0', padding: '0 0 0 18px', fontSize: 14, color: '#444'}}>
              {passwordRequirements.map((r, i) => (
                <li key={i} style={{color: r.test(nuevaPassword) ? '#388e3c' : '#e53935', fontWeight: r.test(nuevaPassword) ? 600 : 400}}>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit" disabled={!passwordValid}>Cambiar contraseña</button>
        </form>
      )}
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
    </div>
  );
};

const PerfilVentas = ({ usuario, onUpdate }) => {
  const [form, setForm] = useState({
    descripcion: usuario.descripcion_perfil || '',
    tieneLocal: usuario.tiene_local || false,
    direccionLocal: usuario.direccion_local || '',
    celular: usuario.celular_contacto || '',
    email: usuario.email || '',
  });
  const [passwordActual, setPasswordActual] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setErrorDetalle('');
    // Validaciones básicas
    if (form.descripcion.length > 500) {
      setMensaje('La descripción no puede superar 500 caracteres.');
      return;
    }
    if (form.tieneLocal && form.direccionLocal.length > 150) {
      setMensaje('La dirección del local no puede superar 150 caracteres.');
      return;
    }
    if (form.celular && !/^\d{10}$/.test(form.celular)) {
      setMensaje('El celular debe tener 10 dígitos.');
      return;
    }
    if (!passwordActual) {
      setMensaje('Debes ingresar tu contraseña actual para guardar los cambios');
      return;
    }
    try {
      await api.patch('http://localhost:8000/api/perfil/', {
        descripcion_perfil: form.descripcion,
        tiene_local: form.tieneLocal,
        direccion_local: form.tieneLocal ? form.direccionLocal : '',
        celular_contacto: String(form.celular),
        email: form.email,
        password_actual: passwordActual
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMensaje('Perfil de ventas actualizado correctamente');
      setPasswordActual('');
      if (onUpdate) onUpdate();
    } catch (err) {
      setMensaje('Error al actualizar el perfil de ventas');
      if (err.response && err.response.data) {
        setErrorDetalle(JSON.stringify(err.response.data));
      }
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="text-2xl font-bold mb-6">Mi perfil de ventas</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Descripción del perfil</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} maxLength={500} className="w-full border rounded px-3 py-2" rows={3} placeholder="Describe tu experiencia, servicios, etc." />
          <div style={{fontSize:12, color:'#888', textAlign:'right'}}>{form.descripcion.length}/500</div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            <input type="checkbox" name="tieneLocal" checked={form.tieneLocal} onChange={handleChange} style={{marginRight:8}} />
            ¿Cuenta con local físico?
          </label>
        </div>
        {form.tieneLocal && (
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Dirección del local</label>
            <input name="direccionLocal" value={form.direccionLocal} onChange={handleChange} maxLength={150} className="w-full border rounded px-3 py-2" placeholder="Dirección del local" />
            <div style={{fontSize:12, color:'#888', textAlign:'right'}}>{form.direccionLocal.length}/150</div>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Celular de contacto</label>
          <input name="celular" value={form.celular} onChange={handleChange} maxLength={10} className="w-full border rounded px-3 py-2" placeholder="Ej: 3001234567" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Correo de contacto" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Contraseña actual <span style={{color:'red'}}>*</span></label>
          <input name="passwordActual" type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Guardar perfil de ventas</button>
      </form>
      {mensaje && <div className="mt-4 text-green-600">{mensaje}</div>}
      {errorDetalle && <div className="mt-2 text-red-600" style={{whiteSpace:'pre-wrap',fontSize:13}}>{errorDetalle}</div>}
    </div>
  );
};

export default Perfil;
