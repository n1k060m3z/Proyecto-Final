import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../style/Publicaciones.css';

const acciones = [
  { label: 'Modificar', value: 'modificar' },
  { label: 'Gestionar precios', value: 'precios' },
  { label: 'Modificar cantidad', value: 'stock' },
  { label: 'Gestionar oferta', value: 'oferta' },
  { label: 'Ir a la página de producto', value: 'ver' },
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
    if (accion === 'Gestionar oferta') {
      // Acción directa, sin confirmación ni prompt
      if (producto.en_oferta) {
        api.patch(`productos/${producto.id}/`, { en_oferta: false }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(recargarProductos);
      } else {
        api.patch(`productos/${producto.id}/`, { en_oferta: true, descuento: 10 }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(recargarProductos);
      }
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
          <button className="btn-toolbar" disabled={seleccionados.length === 0} onClick={pausarSeleccionados}><i className="fa fa-pause" style={{marginRight:4}}/>Pausar</button>
          <button className="btn-toolbar" disabled={seleccionados.length === 0} onClick={reactivarSeleccionados}><i className="fa fa-play" style={{marginRight:4}}/>Reactivar</button>
          <button className="btn-toolbar" disabled={seleccionados.length === 0} onClick={eliminarSeleccionados}><i className="fa fa-trash" style={{marginRight:4}}/>Eliminar</button>
        </div>
      </div>
      <div className="publicaciones-list-scroll">
        <div className="publicaciones-list">
          {productos.map(producto => (
            <div
              key={producto.id}
              className={`publicacion-item-card${seleccionados.includes(producto.id) ? ' seleccionada' : ''}`}
              onClick={e => {
                // Evitar que el click en el menú contextual o botones internos seleccione
                if (
                  e.target.closest('.publicacion-menu-btn') ||
                  e.target.closest('.menu-acciones-publicacion') ||
                  e.target.closest('button') ||
                  e.target.closest('input')
                ) return;
                toggleSeleccion(producto.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="publicacion-item-content">
                <div className="publicacion-item-left">
                  {/* Checkbox eliminado, solo imagen */}
                  <img src={producto.imagen ? `http://localhost:8000${producto.imagen}` : 'https://via.placeholder.com/60'} alt={producto.nombre} />
                </div>
                <div className="publicacion-info">
                  <div className="publicacion-nombre">{producto.nombre}</div>
                  <div className="publicacion-descripcion">{producto.descripcion}</div>
                  <div className="publicacion-precio">${producto.precio}</div>
                  <div className="publicacion-oferta" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                    {producto.en_oferta ? (
                      <>
                        <span style={{ color: '#388e3c', fontWeight: 600 }}>
                          En oferta ({producto.descuento}% desc.)
                        </span>
                        <button
                          className="btn-oferta quitar"
                          onClick={async () => {
                            await api.patch(`productos/${producto.id}/`, { en_oferta: false }, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            recargarProductos();
                          }}
                          title="Quitar oferta"
                        ><i className="fa fa-times" style={{marginRight:4}}/>Quitar</button>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={producto.descuento}
                          className="input-descuento"
                          onChange={async e => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 0) val = 0;
                            if (val > 100) val = 100;
                            await api.patch(`productos/${producto.id}/`, { descuento: val }, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            recargarProductos();
                          }}
                          title="Editar descuento"
                        />
                        <span style={{ fontSize: 13, color: '#888' }}>%</span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: '#888' }}>Sin oferta</span>
                        <button
                          className="btn-oferta poner"
                          onClick={async () => {
                            await api.patch(`productos/${producto.id}/`, { en_oferta: true, descuento: 10 }, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            recargarProductos();
                          }}
                          title="Poner en oferta"
                        ><i className="fa fa-tag" style={{marginRight:4}}/>Poner en oferta</button>
                      </>
                    )}
                  </div>
                  <div className="gestion-cantidad">
                    <b>Stock:</b> <span className="stock-num">{producto.stock}</span>
                    {editandoStock === producto.id ? (
                      <span className="stock-edicion">
                        <input
                          type="number"
                          min={1}
                          value={nuevoStock}
                          className="input-stock"
                          onChange={e => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) val = 1;
                            setNuevoStock(val);
                          }}
                        />
                        <button
                          className="btn-stock guardar"
                          onClick={async () => {
                            await api.patch(`productos/${producto.id}/`, { stock: nuevoStock }, {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            setEditandoStock(null);
                            recargarProductos();
                          }}
                        ><i className="fa fa-check"/></button>
                        <button className="btn-stock cancelar" onClick={() => setEditandoStock(null)}><i className="fa fa-times"/></button>
                      </span>
                    ) : (
                      <button className="btn-stock editar" onClick={() => { setEditandoStock(producto.id); setNuevoStock(producto.stock || 1); }} title="Editar stock"><i className="fa fa-edit"/></button>
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
                <button className="publicacion-menu-btn" onClick={e => { setMenuAccion(producto.id); setAnchorMenu(e.target); }}>⋮</button>
                {menuAccion === producto.id && (
                  <div className="menu-acciones-publicacion">
                    {acciones.map(a => (
                      <div key={a.value} className="accion-menu-item" onClick={() => handleAccion(a.label, producto)}>
                        <i className={
                          a.value === 'modificar' ? 'fa fa-edit' :
                          a.value === 'precios' ? 'fa fa-dollar-sign' :
                          a.value === 'stock' ? 'fa fa-boxes' :
                          a.value === 'oferta' ? 'fa fa-tag' :
                          a.value === 'ver' ? 'fa fa-eye' : ''
                        } style={{marginRight:8}}/>{a.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Publicaciones;
