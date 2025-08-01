import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../style/Publicaciones.css';

const acciones = [
  { label: 'Modificar', value: 'modificar' },
  { label: 'Gestionar precios', value: 'precios' },
  { label: 'Modificar cantidad', value: 'stock' },
  { label: 'Ir a la página de producto', value: 'ver' },
  { label: 'Analizar rendimiento', value: 'rendimiento' },
  { label: 'Necesito ayuda', value: 'ayuda' },
];

const Publicaciones = () => {
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [menuAccion, setMenuAccion] = useState(null);
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [editandoStock, setEditandoStock] = useState(null); // id del producto que se está editando
  const [nuevoStock, setNuevoStock] = useState(1);
  const navigate = useNavigate();

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
  const pausarSeleccionados = async (idsParam) => {
    const ids = Array.isArray(idsParam) ? idsParam : seleccionados;
    if (!Array.isArray(ids) || ids.length === 0) return;
    try {
      for (const id of ids) {
        const res = await api.patch(`productos/${id}/`, { activo: false }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('PATCH response (pausar):', res);
      }
      toast.success('Publicación(es) pausada(s)');
      recargarProductos();
    } catch (err) {
      console.error('Error al pausar:', err?.response || err);
      toast.error('Error al pausar publicaciones: ' + (err?.response?.data?.detail || err?.message || ''));
    }
  };
  const reactivarSeleccionados = async (idsParam) => {
    const ids = Array.isArray(idsParam) ? idsParam : seleccionados;
    if (!Array.isArray(ids) || ids.length === 0) return;
    try {
      for (const id of ids) {
        const res = await api.patch(`productos/${id}/`, { activo: true }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('PATCH response (reactivar):', res);
      }
      toast.success('Publicación(es) reactivada(s)');
      recargarProductos();
    } catch (err) {
      console.error('Error al reactivar:', err?.response || err);
      toast.error('Error al reactivar publicaciones: ' + (err?.response?.data?.detail || err?.message || ''));
    }
  };
  const eliminarSeleccionados = async (idsParam) => {
    const ids = Array.isArray(idsParam) ? idsParam : seleccionados;
    if (!Array.isArray(ids) || ids.length === 0) return;
    if (!window.confirm('¿Estás seguro de eliminar las publicaciones seleccionadas?')) return;
    try {
      for (const id of ids) {
        const res = await api.delete(`productos/${id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('DELETE response:', res);
      }
      toast.success('Publicación(es) eliminada(s)');
      recargarProductos();
    } catch (err) {
      console.error('Error al eliminar:', err?.response || err);
      toast.error('Error al eliminar publicaciones: ' + (err?.response?.data?.detail || err?.message || ''));
    }
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
    if (accion === 'Modificar' || accion === 'Gestionar precios') {
      navigate(`/editar-publicacion/${producto.id}`);
      return;
    }
    if (accion === 'Modificar cantidad') {
      setEditandoStock(producto.id);
      setNuevoStock(producto.stock || 1);
      return;
    }
    if (accion === 'Ir a la página de producto') {
      navigate(`/producto/${producto.id}`);
      return;
    }
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
    <div className="publicaciones-container">
      <h2 className="publicaciones-header">Gestión de publicaciones</h2>
      <div className="publicaciones-toolbar">
        <input type="checkbox" checked={seleccionados.length === productos.length && productos.length > 0} onChange={seleccionarTodos} />
        <span>{seleccionados.length} seleccionada{seleccionados.length !== 1 ? 's' : ''}</span>
        <div className="acciones">
          <button disabled={seleccionados.length === 0} onClick={pausarSeleccionados}>Pausar</button>
          <button disabled={seleccionados.length === 0} onClick={reactivarSeleccionados}>Reactivar</button>
          <button disabled={seleccionados.length === 0} onClick={eliminarSeleccionados}>Eliminar</button>
        </div>
      </div>
      <div className="publicaciones-list-scroll">
        <div className="publicaciones-list">
          {productos.map(producto => (
            <div key={producto.id} className="publicacion-item">
              <input type="checkbox" checked={seleccionados.includes(producto.id)} onChange={() => toggleSeleccion(producto.id)} />
              <img src={producto.imagen ? `http://localhost:8000${producto.imagen}` : 'https://via.placeholder.com/60'} alt={producto.nombre} />
              <div className="publicacion-info">
                <div className="publicacion-nombre">{producto.nombre}</div>
                <div className="publicacion-descripcion">{producto.descripcion}</div>
                <div className="publicacion-precio">${producto.precio}</div>
                <div className="publicacion-oferta">
                  <label style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={producto.en_oferta}
                      onChange={async e => {
                        await api.patch(`productos/${producto.id}/`, { en_oferta: e.target.checked }, {
                          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        recargarProductos();
                      }}
                    />{' '}
                    En oferta
                  </label>
                  {producto.en_oferta && (
                    <label style={{ marginLeft: 16 }}>
                      Descuento (%):
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={producto.descuento}
                        style={{ width: 60, marginLeft: 8 }}
                        onChange={async e => {
                          let val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 0) val = 0;
                          if (val > 100) val = 100;
                          await api.patch(`productos/${producto.id}/`, { descuento: val }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          recargarProductos();
                        }}
                      />
                    </label>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <b>Stock:</b> {producto.stock}
                  {editandoStock === producto.id && (
                    <span style={{ marginLeft: 8 }}>
                      <input
                        type="number"
                        min={1}
                        value={nuevoStock}
                        style={{ width: 70, marginRight: 8 }}
                        onChange={e => {
                          let val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) val = 1;
                          setNuevoStock(val);
                        }}
                      />
                      <button
                        onClick={async () => {
                          await api.patch(`productos/${producto.id}/`, { stock: nuevoStock }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          setEditandoStock(null);
                          recargarProductos();
                        }}
                        style={{ marginRight: 4 }}
                      >Guardar</button>
                      <button onClick={() => setEditandoStock(null)}>Cancelar</button>
                    </span>
                  )}
                </div>
                {producto.activo ? (
                  <span className="publicacion-estado activo">
                    ● Activo
                  </span>
                ) : (
                  <span className="publicacion-estado pausado">
                    ● Pausado
                  </span>
                )}
              </div>
              <div className="publicacion-ml">
                ML
              </div>
              <button className="publicacion-menu-btn" onClick={e => { setMenuAccion(producto.id); setAnchorMenu(e.target); }}>⋮</button>
              {menuAccion === producto.id && (
                <div className="menu-acciones-publicacion">
                  {acciones.map(a => (
                    <div key={a.value} onClick={() => handleAccion(a.label, producto)}>{a.label}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Publicaciones;
