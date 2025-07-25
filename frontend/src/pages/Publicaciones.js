import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const acciones = [
  { label: 'Modificar', value: 'modificar' },
  { label: 'Gestionar precios', value: 'precios' },
  { label: 'Ir a la página de producto', value: 'ver' },
  { label: 'Aumentar exposición', value: 'exposicion' },
  { label: 'Analizar rendimiento', value: 'rendimiento' },
  { label: 'Necesito ayuda', value: 'ayuda' },
];

const Publicaciones = () => {
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [menuAccion, setMenuAccion] = useState(null);
  const [anchorMenu, setAnchorMenu] = useState(null);

  useEffect(() => {
    api.get('http://localhost:8000/api/mis-publicaciones/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setProductos(res.data))
      .catch(() => setProductos([]));
  }, []);

  const toggleSeleccion = id => {
    setSeleccionados(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === productos.length) setSeleccionados([]);
    else setSeleccionados(productos.map(p => p.id));
  };

  // --- Acciones funcionales ---
  const pausarSeleccionados = async () => {
    for (const id of seleccionados) {
      await api.patch(`http://localhost:8000/api/productos/${id}/`, { activo: false }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    }
    recargarProductos();
  };
  const reactivarSeleccionados = async () => {
    for (const id of seleccionados) {
      await api.patch(`http://localhost:8000/api/productos/${id}/`, { activo: true }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    }
    recargarProductos();
  };
  const eliminarSeleccionados = async () => {
    for (const id of seleccionados) {
      await api.delete(`http://localhost:8000/api/productos/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    }
    recargarProductos();
  };
  const recargarProductos = () => {
    api.get('http://localhost:8000/api/mis-publicaciones/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setProductos(res.data))
      .catch(() => setProductos([]));
    setSeleccionados([]);
  };

  const handleAccion = (accion, producto) => {
    setMenuAccion(null);
    if (accion === 'Eliminar') {
      eliminarSeleccionados([producto.id]);
      return;
    }
    if (accion === 'Pausar') {
      pausarSeleccionados([producto.id]);
      return;
    }
    if (accion === 'Reactivar') {
      reactivarSeleccionados([producto.id]);
      return;
    }
    // Aquí puedes implementar cada acción según el valor
    alert(`Acción: ${accion} sobre producto ${producto.nombre}`);
  };

  // Cerrar menú de acciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuAccion && !e.target.closest('.menu-acciones-publicacion')) {
        setMenuAccion(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAccion]);

  return (
    <div className="container" style={{ maxWidth: 1100, margin: '2rem auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h2 className="text-2xl font-bold mb-6">Gestión de publicaciones</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <input type="checkbox" checked={seleccionados.length === productos.length && productos.length > 0} onChange={seleccionarTodos} />
        <span style={{ marginLeft: 8 }}>{seleccionados.length} seleccionada{seleccionados.length !== 1 ? 's' : ''}</span>
        <div style={{ marginLeft: 32, display: 'flex', gap: 24 }}>
          <button disabled={seleccionados.length === 0} className="text-blue-600 hover:underline" onClick={pausarSeleccionados}>Pausar</button>
          <button disabled={seleccionados.length === 0} className="text-blue-600 hover:underline" onClick={reactivarSeleccionados}>Reactivar</button>
          <button disabled={seleccionados.length === 0} className="text-blue-600 hover:underline" onClick={eliminarSeleccionados}>Eliminar</button>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #eee' }}>
        {productos.map(producto => (
          <div key={producto.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '18px 0' }}>
            <input type="checkbox" checked={seleccionados.includes(producto.id)} onChange={() => toggleSeleccion(producto.id)} />
            <img src={producto.imagen ? `http://localhost:8000${producto.imagen}` : 'https://via.placeholder.com/60'} alt={producto.nombre} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, margin: '0 18px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{producto.nombre}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{producto.descripcion}</div>
              <div style={{ color: '#2563eb', fontWeight: 500, fontSize: 15, marginTop: 4 }}>${producto.precio}</div>
            </div>
            <div style={{ marginRight: 18 }}>
              <span style={{ background: '#ffe600', color: '#222', fontWeight: 700, fontSize: 13, borderRadius: 4, padding: '2px 8px' }}>ML</span>
            </div>
            <button onClick={e => { setMenuAccion(producto.id); setAnchorMenu(e.target); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>⋮</button>
            {menuAccion === producto.id && (
              <div className="menu-acciones-publicacion" style={{ position: 'absolute', background: 'white', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 12px #0002', right: 60, zIndex: 10 }}>
                {acciones.map(a => (
                  <div key={a.value} className="hover:bg-gray-100 px-4 py-2 cursor-pointer" onClick={() => handleAccion(a.label, producto)}>{a.label}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publicaciones;
