import React, { useEffect, useState } from 'react';
import AgendaServicioFechas from './AgendaServicioFechas';
import { getSolicitudesServicio, updateSolicitudServicio, negociarSolicitudServicio, aceptarPropuestaServicio, getProductosVendidos, crearCalificacion } from '../api/ventas';
import { calcularNotificaciones } from '../api/notificaciones';
import Estrellas from "./Estrellas";
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const Ventas = ({ modoCompras, usuario, setNotifsGlobal, calcularNotificaciones }) => {
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [negociando, setNegociando] = useState({});
  // Estado local para calificaciones por producto (mapa de keys)
  const [calificaciones, setCalificaciones] = useState(() => {
    const data = JSON.parse(localStorage.getItem('calificaciones_compras') || '{}');
    return data;
  });

  // Helper para mostrar un badge con el estado legible y colores
  const renderEstadoBadge = (estado) => {
    let text = 'En espera';
    let bg = '#f5f5f5';
    let color = '#616161';
    if (!estado) estado = 'pendiente';
    if (estado === 'aceptado') { text = 'Aceptado'; bg = '#e6f4ea'; color = '#2e7d32'; }
    else if (estado === 'rechazado') { text = 'Rechazado'; bg = '#fff0f0'; color = '#c62828'; }
    else if (estado === 'negociacion') { text = 'En negociación'; bg = '#fffbe6'; color = '#ad8b00'; }
    else if (estado === 'pendiente') { text = 'En espera'; bg = '#f5f5f5'; color = '#616161'; }
    return <span style={{marginLeft:12, padding:'4px 8px', borderRadius:12, background:bg, color:color, fontWeight:700, fontSize:12}}>{text}</span>;
  };

  // Al montar o cuando cambia el usuario, sincronizar con calificaciones guardadas en backend (/api/calificaciones/mis/)
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    if (!token) return;
    // Obtener calificaciones del backend y normalizarlas a las keys usadas en la UI
    api.get('calificaciones/mis/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!mounted) return;
        const data = res.data || [];
        const mapa = { ...(JSON.parse(localStorage.getItem('calificaciones_compras') || '{}')) };
        data.forEach(c => {
          if (c.producto) {
            // clave basada en producto para lookup genérico
            mapa[`prod-${c.producto}`] = c.valor;
          }
          if (c.solicitud_servicio) {
            mapa[`servicio-${c.solicitud_servicio}`] = c.valor;
          }
          if (c.pedido_item) {
            mapa[`item-${c.pedido_item}`] = c.valor;
          }
        });
        localStorage.setItem('calificaciones_compras', JSON.stringify(mapa));
        setCalificaciones(mapa);
      })
      .catch(() => {
        // si falla, dejamos lo que haya en localStorage
      });
    return () => { mounted = false; };
  }, [usuario]);

  // Helper: refrescar calificaciones del usuario desde backend y sincronizar localStorage
  const refrescarMisCalificaciones = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('calificaciones/mis/', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data || [];
      const mapa = { ...(JSON.parse(localStorage.getItem('calificaciones_compras') || '{}')) };
      data.forEach(c => {
        if (c.producto) mapa[`prod-${c.producto}`] = c.valor;
        if (c.solicitud_servicio) mapa[`servicio-${c.solicitud_servicio}`] = c.valor;
        if (c.pedido_item) mapa[`item-${c.pedido_item}`] = c.valor;
      });
      localStorage.setItem('calificaciones_compras', JSON.stringify(mapa));
      setCalificaciones(mapa);
    } catch (err) {
      console.error('No se pudo refrescar calificaciones', err);
    }
  };

  // Función para calificar un producto
  const calificarProducto = async (producto, valor) => {
    // producto aquí es el item del pedido; el objeto real del producto está en producto.producto
    const keyCompra = producto.compraId + '-' + producto.id; // compraId - pedidoItemId
    const productId = producto.producto ? producto.producto.id : null;
    const pedidoItemId = producto.id; // id del PedidoItem en la respuesta del backend
    try {
      if (!productId && !pedidoItemId) throw new Error('ID de producto no encontrado');
      // Preparar payload: preferir asociarlo al pedido_item para permitir 1 calificación por compra
      const payload = pedidoItemId ? { pedido_item: pedidoItemId, valor, comentario: '' } : { producto: productId, valor, comentario: '' };
      await crearCalificacion(payload);
      // refrescar desde backend para asegurar consistencia
      await refrescarMisCalificaciones();
      // actualizar local inmediatamente tambien
      const nuevasCalificaciones = { ...calificaciones, [keyCompra]: valor };
      if (productId) nuevasCalificaciones[`prod-${productId}`] = valor;
      if (pedidoItemId) nuevasCalificaciones[`item-${pedidoItemId}`] = valor;
      setCalificaciones(nuevasCalificaciones);
      localStorage.setItem('calificaciones_compras', JSON.stringify(nuevasCalificaciones));
      toast.success('Calificación guardada');
      // Intentar actualizar información del producto local (average_rating) y del vendedor
      try {
        if (productId) {
          const resProd = await api.get(`productos/${productId}/`);
          // actualizar productos en estado si contiene este producto
          setProductos(prev => prev.map(p => {
            const pid = p.producto ? p.producto.id : p.id;
            if (pid === productId) {
              return { ...p, producto: { ...(p.producto || {}), ...resProd.data } };
            }
            return p;
          }));
          // Obtener rating del vendedor y actualizar localStorage/estados si es necesario
          try {
            const vendedorId = resProd.data.vendedor?.id || (resProd.data.vendedor && resProd.data.vendedor.id);
            if (vendedorId) {
              const resV = await api.get(`usuarios/${vendedorId}/rating/`);
              localStorage.setItem(`vendedor_rating_${vendedorId}`, JSON.stringify(resV.data));
            }
          } catch (e) {
            // no crítico
          }
        }
        // ya no recargamos la página; actualizamos estado local
      } catch (err) {
        // Si no se pudo obtener, intentar solo refrescar mis calificaciones
        await refrescarMisCalificaciones();
      }
    } catch (err) {
      console.error('Error al crear calificación producto', err);
      const msg = err?.response?.data?.error || err?.response?.data || err.message || 'No se pudo guardar la calificación.';
      toast.error(msg);
    }
  };

  // Función para eliminar una compra de producto del historial
  const eliminarCompraProducto = (compraId, productoId) => {
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const nuevasCompras = compras.map(c => {
      if (c.id === compraId) {
        return { ...c, items: c.items.filter(item => item.id !== productoId) };
      }
      return c;
    }).filter(c => c.items.length > 0);
    localStorage.setItem('compras', JSON.stringify(nuevasCompras));
    setProductos(prev => prev.filter(p => !(p.compraId === compraId && p.id === productoId)));
  };

  const calificarServicio = async (servicio, valor) => {
    const key = 'servicio-' + servicio.id;
    try {
      await crearCalificacion({ solicitud_servicio: servicio.id, valor, comentario: '' });
      await refrescarMisCalificaciones();
      const nuevasCalificaciones = { ...calificaciones, [key]: valor };
      setCalificaciones(nuevasCalificaciones);
      localStorage.setItem('calificaciones_compras', JSON.stringify(nuevasCalificaciones));
      toast.success('Calificación de servicio guardada');
      // actualizar solicitud local y obtener rating del vendedor
      try {
        const resSol = await api.get(`solicitudes-servicio/${servicio.id}/`);
        setServicios(prev => prev.map(s => s.id === servicio.id ? { ...s, ...resSol.data } : s));
        // obtener rating del vendedor asociado al servicio
        try {
          const vendedorId = resSol.data.vendedor;
          if (vendedorId) {
            const resV = await api.get(`usuarios/${vendedorId}/rating/`);
            localStorage.setItem(`vendedor_rating_${vendedorId}`, JSON.stringify(resV.data));
          }
        } catch (e) {
          // no crítico
        }
      } catch (e) {
        // si falla, al menos refrescamos mis calificaciones
        await refrescarMisCalificaciones();
      }
    } catch (err) {
      console.error('Error al crear calificación servicio', err);
      const msg = err?.response?.data?.error || err?.response?.data || err.message || 'No se pudo guardar la calificación.';
      toast.error(msg);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let serviciosFiltrados = [];
        let productosComprados = [];

        // Obtener solicitudes de servicio del backend (si hay token)
        try {
          const solicitudes = await getSolicitudesServicio();
          if (Array.isArray(solicitudes)) {
            // Filtrar según el modo: si modoCompras -> solicitudes donde es cliente, si es vendedor -> donde es vendedor
            if (modoCompras && usuario) {
              serviciosFiltrados = solicitudes.filter(s => s.cliente === usuario.id || s.cliente === usuario.user_id);
            } else if (!modoCompras && usuario) {
              serviciosFiltrados = solicitudes.filter(s => s.vendedor === usuario.id || s.vendedor === usuario.user_id);
            }
          }
        } catch (e) {
          // Si falla, dejamos serviciosFiltrados como [] y seguimos
          serviciosFiltrados = [];
        }

        if (modoCompras && usuario) {
          // --- Mostrar compras de productos guardadas en localStorage o desde backend ---
          try {
            const getPedidosCliente = require('../api/ventas').getPedidosCliente;
            const pedidosBackend = await getPedidosCliente();
            const misCompras = pedidosBackend || JSON.parse(localStorage.getItem('compras') || '[]');
            productosComprados = misCompras.flatMap(compra =>
              compra.items
                .filter(item => !item.es_servicio) // Excluir items que son servicios
                .map(item => ({
                ...item,
                compraId: compra.id,
                fecha: compra.creado || compra.fecha,
                metodo: item.metodo || 'contraentrega',
                datosEntrega: item.datosEntrega
              }))
            );
          } catch (e) {
            const compras = JSON.parse(localStorage.getItem('compras') || '[]');
            const misCompras = compras.filter(c => c.usuarioId === usuario.id || c.usuarioId === usuario.user_id);
            productosComprados = misCompras.flatMap(compra =>
              compra.items.map(item => ({
                ...item,
                compraId: compra.id,
                fecha: compra.fecha,
                metodo: compra.metodo,
                datosEntrega: compra.datosEntrega
              }))
            );
          }
        } else if (!modoCompras && usuario) {
          // Mostrar productos vendidos por el usuario (vendedor)
          const pedidos = await getProductosVendidos();
          // Aplanar todos los items de todos los pedidos donde el producto es del vendedor actual
          const vendidos = pedidos.flatMap(pedido =>
            pedido.items
              .filter(item => item.producto && item.producto.vendedor && (item.producto.vendedor.id === usuario.id) && !item.es_servicio)
              .map(item => ({
                ...item,
                nombre: item.producto.nombre,
                comprador: pedido.usuario_username || pedido.usuario, // Ajusta según backend
                fechaVenta: pedido.creado,
                precio: item.producto.precio,
                metodo: item.metodo || 'contraentrega', // Si tienes campo metodo en item
                enviado: item.enviado
              }))
          );
          productosComprados = vendidos;
        }
        setServicios(serviciosFiltrados);
        setProductos(productosComprados); // Ahora productos es para productos comprados
      } catch {
        setServicios([]);
        setProductos([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [modoCompras, usuario]);

  const aceptarServicio = async (id) => {
    try {
      const res = await updateSolicitudServicio(id, 'aceptado');
      // Si backend devuelve mensaje o el objeto actualizado
      setServicios(prev => prev.map(s => s.id === id ? { ...s, estado: 'aceptado', fecha: res.fecha || s.fecha, hora: res.hora || s.hora } : s));
      // recalcular notificaciones globales
      if (typeof setNotifsGlobal === 'function') {
        const usuarioLocal = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        calcularNotificaciones && calcularNotificaciones(usuarioLocal).then(n => {
          if (n && n.notifKey) localStorage.setItem('ultima_notif_key', n.notifKey);
          setNotifsGlobal && setNotifsGlobal(n);
        }).catch(()=>{});
      }
    } catch (err) {
      console.error(err);
      alert('Error al aceptar la solicitud');
    }
  };
  const rechazarServicio = async (id) => {
    try {
      const res = await updateSolicitudServicio(id, 'rechazado');
      // Si backend elimina la solicitud, la respuesta tendrá mensaje; quitar del estado
      if (res && res.mensaje) {
        setServicios(prev => prev.filter(s => s.id !== id));
      } else {
        // Si no se eliminó por alguna razón, marcar como rechazado en UI para permitir eliminar manualmente
        setServicios(prev => prev.map(s => s.id === id ? { ...s, estado: 'rechazado' } : s));
      }
      // recalcular notificaciones globales
      if (typeof setNotifsGlobal === 'function') {
        const usuarioLocal = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        calcularNotificaciones && calcularNotificaciones(usuarioLocal).then(n => {
          if (n && n.notifKey) localStorage.setItem('ultima_notif_key', n.notifKey);
          setNotifsGlobal && setNotifsGlobal(n);
        }).catch(()=>{});
      }
    } catch (err) {
      console.error(err);
      alert('Error al rechazar la solicitud');
    }
  };
  const handleNegociar = async (id, fecha, hora) => {
    await negociarSolicitudServicio(id, { fecha_propuesta: fecha, hora_propuesta: hora });
    setServicios(prev => prev.map(s => s.id === id ? { ...s, fecha_propuesta: fecha, hora_propuesta: hora, estado: 'negociacion', ultima_propuesta_por: modoCompras ? 'comprador' : 'vendedor' } : s));
    setNegociando(prev => ({ ...prev, [id]: undefined }));
  };
  const handleAceptarPropuesta = async (id) => {
    try {
      const res = await aceptarPropuestaServicio(id);
      // Si el cliente acepta la propuesta, el backend devuelve la solicitud actualizada
      setServicios(prev => prev.map(s => s.id === id ? { ...s, estado: 'aceptado', fecha: res.fecha || s.fecha, hora: res.hora || s.hora } : s));
    } catch (err) {
      console.error(err);
      alert('Error al aceptar la propuesta');
    }
  };
  const eliminarSolicitud = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta solicitud del historial?')) return;
    try {
      await getSolicitudesServicio.deleteSolicitud(id); // Debe implementarse en api/ventas.js
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Error al eliminar la solicitud');
    }
  };

  if (loading) return <div>Cargando...</div>;

  // Notificación visual para negociaciones pendientes
  const hayNegociacion = servicios.some(s =>
    s.estado === 'negociacion' &&
    ((modoCompras && s.ultima_propuesta_por === 'vendedor') || (!modoCompras && s.ultima_propuesta_por === 'comprador'))
  );

  return (
    <div style={{maxHeight: 500, overflowY: 'auto', paddingRight: 8}}>
      {hayNegociacion && (
        <div style={{background:'#fffbe6',border:'1px solid #ffe58f',color:'#ad8b00',padding:12,borderRadius:8,marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontWeight:700,fontSize:16}}>¡Tienes una negociación pendiente!</span>
          <span style={{fontSize:14}}>
            {modoCompras
              ? 'El vendedor ha propuesto una nueva fecha/hora para un servicio.'
              : 'Un comprador ha propuesto una nueva fecha/hora para un servicio.'}
          </span>
        </div>
      )}
      {modoCompras ? (
        <>
          {/* Mostrar servicios también para el comprador */}
          <h3 style={{marginTop: 0}}>Servicios en negociación</h3>
          {servicios.length === 0 ? (
            <div style={{color:'#888'}}>No tienes servicios solicitados.</div>
          ) : (
            <div className="publicaciones-list-scroll">
              <div className="publicaciones-list">
                {servicios.map(servicio => {
                  const negociandoActual = negociando[servicio.id] || { fecha: servicio.fecha_propuesta || '', hora: servicio.hora_propuesta || '08:00' };
                  const keyServicio = 'servicio-' + servicio.id;
                  const calificacionServicio = typeof calificaciones[keyServicio] === 'number' ? calificaciones[keyServicio] : 0;
                  const puedeCalificarServicio = modoCompras && servicio.estado === 'aceptado';
                  // Mostrar la relación correctamente: si estoy en modoCompras muestro el vendedor (De ...), si soy vendedor muestro el cliente (para ...)
                  const quienTexto = modoCompras ? `De ${servicio.vendedor_nombre}` : `para ${servicio.cliente_nombre}`;
                  return (
                    <div key={servicio.id} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#f9f9f9', position:'relative'}}>
                      <button
                        className="btn-eliminar-solicitud"
                        style={{position:'absolute',top:8,right:8,background:'#2563eb',color:'#fff',border:'1px solid #2563eb',borderRadius:4,padding:'2px 10px',fontSize:14,cursor:'pointer',transition:'all .2s'}}
                        onMouseOver={e=>{e.currentTarget.style.background='#e53935';e.currentTarget.style.borderColor='#e53935';}}
                        onMouseOut={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.borderColor='#2563eb';}}
                        onClick={()=>eliminarSolicitud(servicio.id)}
                      >Eliminar</button>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <div style={{display:'flex', alignItems:'center'}}><b>{servicio.servicio_nombre}</b> <span style={{color:'#2563eb', marginLeft:6}}>{quienTexto}</span></div>
                        {renderEstadoBadge(servicio.estado)}
                      </div>
                      <div style={{fontSize:13, color:'#555'}}>Solicitado el {servicio.fecha_solicitud?.slice(0,10)}</div>
                      <div style={{fontSize:13, color:'#555'}}>Detalles: {servicio.detalles}</div>
                      {/* Mostrar dirección provista por el comprador si existe */}
                      {(servicio.direccion || servicio.barrio || servicio.ciudad || servicio.ciudad_nombre) && (
                        <div style={{fontSize:13, color:'#555', marginTop:6}}>
                          <b>Dirección:</b> {servicio.direccion || '—'}{servicio.barrio ? `, Barrio ${servicio.barrio}` : ''}{(servicio.ciudad_nombre || servicio.ciudad) ? `, ${servicio.ciudad_nombre || servicio.ciudad}` : ''}
                        </div>
                      )}
                      {/* Si existe negociación o propuesta */}
                      {servicio.estado === 'pendiente' || servicio.estado === 'negociacion' ? (
                        <div style={{marginTop:10}}>
                          {/* Si hay propuesta del vendedor, comprador puede aceptar */}
                          {servicio.fecha_propuesta && servicio.hora_propuesta && servicio.ultima_propuesta_por==='vendedor' && (
                            <div style={{marginTop:8}}>
                              <span style={{fontSize:13}}>El vendedor propone: <b>{servicio.fecha_propuesta}</b> a las <b>{servicio.hora_propuesta}</b></span>
                              <button onClick={()=>handleAceptarPropuesta(servicio.id)} style={{marginLeft:12,background:'#388e3c',color:'#fff',border:'none',borderRadius:4,padding:'6px 14px'}}>Aceptar propuesta</button>
                            </div>
                          )}
                        </div>
                      ) : null}
                      <div style={{marginTop:12}}>
                        <AgendaServicioFechas fechas={servicio.fecha && servicio.hora ? [{fecha: servicio.fecha, hora: servicio.hora}] : []} />
                      </div>
                      {/* Mostrar aviso pidiendo calificación cuando el servicio está aceptado y lo ve el comprador */}
                      {modoCompras && servicio.estado === 'aceptado' && (
                        <div style={{marginTop:8, color:'#2e7d32', fontWeight:700}}>Por favor, califica mi servicio</div>
                      )}
                      {puedeCalificarServicio && (
                        <div style={{marginTop:8}}>
                          <div style={{fontWeight:700, marginBottom:6}}>Califica el servicio</div>
                          <Estrellas value={calificacionServicio} onChange={valor => calificarServicio(servicio, valor)} size={28} readOnly={!puedeCalificarServicio} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <h3 style={{marginTop: 0}}>Productos comprados</h3>
          {productos.length === 0 ? (
            <div style={{color:'#888'}}>No tienes productos comprados.</div>
          ) : (
            <div className="publicaciones-list-scroll">
              <div className="publicaciones-list">
                {productos.map(producto => {
                  const key = producto.compraId + '-' + producto.id;
                  // Priorizar: 1) calificación por pedido_item (item-<id>), 2) por compra (compraId-itemId), 3) por producto (prod-<productId>)
                  const posibleProdId = producto.producto ? producto.producto.id : producto.id;
                  const itemKey = `item-${producto.id}`; // id corresponde al PedidoItem
                  const prodKey = `prod-${posibleProdId}`;
                  const calificacion = typeof calificaciones[itemKey] === 'number'
                    ? calificaciones[itemKey]
                    : (typeof calificaciones[key] === 'number'
                      ? calificaciones[key]
                      : (typeof calificaciones[prodKey] === 'number' ? calificaciones[prodKey] : 0));

                  // No mostrar las estrellas en el listado de productos comprados; el botón de calificar aparecerá cuando corresponda en la UI (seguimos permitiendo calificar al pulsar en el producto si está disponible)
                  const puedeCalificar = producto.enviado && !calificacion; // Ejemplo: solo si enviado y no calificado
                  return (
                    <div key={key} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#fff', display:'flex', alignItems:'center', gap:16, position:'relative'}}>
                      <img src={producto.producto?.imagen || producto.imagen || 'https://via.placeholder.com/60'} alt={producto.producto?.nombre || producto.nombre || 'Producto'} style={{width:60, height:60, objectFit:'cover', borderRadius:8}} />
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, fontSize:16}}>{producto.producto?.nombre || producto.nombre || 'Producto'}</div>
                        {/* Estrellas de calificación INTERACTIVAS solo si puedeCalificar */}
                        <div style={{margin:'4px 0 8px 0'}}>
                          <Estrellas value={calificacion} onChange={valor => calificarProducto(producto, valor)} size={32} readOnly={!puedeCalificar} />
                          {producto.metodo === 'contraentrega' && !producto.enviado && (
                            <div style={{fontSize:13, color:'#e53935'}}>Solo podrás calificar cuando el vendedor marque como enviado.</div>
                          )}
                        </div>
                        <div style={{fontSize:14}}>Cantidad: {producto.cantidad}</div>
                        <div style={{fontSize:14}}>Precio unitario: ${producto.producto?.precio?.toLocaleString() || producto.precio?.toLocaleString() || '0'}</div>
                        <div style={{fontSize:14}}>Fecha de compra: {producto.fecha ? new Date(producto.fecha).toLocaleString() : ''}</div>
                        <div style={{fontSize:14}}>Método de pago: {producto.metodo}</div>
                        {producto.metodo === 'contraentrega' && producto.enviado && (
                          <div style={{fontSize:13, color:'#388e3c'}}>Producto marcado como enviado</div>
                        )}
                      </div>
                      <div style={{fontWeight:700, fontSize:18, color:'#2563eb'}}>
                        Total: ${(producto.producto?.precio || producto.precio || 0) * producto.cantidad}
                      </div>
                      <button
                        className="btn-eliminar-solicitud"
                        style={{position:'absolute',top:8,right:8,background:'#2563eb',color:'#fff',border:'1px solid #2563eb',borderRadius:4,padding:'2px 10px',fontSize:14,cursor:'pointer',transition:'all .2s'}}
                        onMouseOver={e=>{e.currentTarget.style.background='#e53935';e.currentTarget.style.borderColor='#e53935';}}
                        onMouseOut={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.borderColor='#2563eb';}}
                        onClick={()=>eliminarCompraProducto(producto.compraId, producto.id)}
                      >Eliminar</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Aquí podrías mostrar servicios solicitados si los tienes */}
        </>
      ) : (
        <>
          <h3 style={{marginTop: 0}}>{modoCompras ? 'Servicios solicitados' : 'Servicios en negociación'}</h3>
          {servicios.length === 0 ? (
            <div style={{color:'#888'}}>{modoCompras ? 'No tienes servicios solicitados.' : 'No tienes servicios en negociación.'}</div>
          ) : (
            <div className="publicaciones-list-scroll">
              <div className="publicaciones-list">
                {servicios.map(servicio => {
                  const negociandoActual = negociando[servicio.id] || { fecha: servicio.fecha_propuesta || '', hora: servicio.hora_propuesta || '08:00' };
                  // Calificación para servicio: key 'servicio-<id>'
                  const keyServicio = 'servicio-' + servicio.id;
                  const calificacionServicio = typeof calificaciones[keyServicio] === 'number' ? calificaciones[keyServicio] : 0;
                  const puedeCalificarServicio = modoCompras && servicio.estado === 'aceptado';
                  // Mostrar la relación correctamente: si estoy en modoCompras muestro el vendedor (De ...), si soy vendedor muestro el cliente (para ...)
                  const quienTexto = modoCompras ? `De ${servicio.vendedor_nombre}` : `para ${servicio.cliente_nombre}`;
                   return (
                     <div key={servicio.id} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#f9f9f9', position:'relative'}}>
                       <button
                         className="btn-eliminar-solicitud"
                         style={{position:'absolute',top:8,right:8,background:'#2563eb',color:'#fff',border:'1px solid #2563eb',borderRadius:4,padding:'2px 10px',fontSize:14,cursor:'pointer',transition:'all .2s'}}
                         onMouseOver={e=>{e.currentTarget.style.background='#e53935';e.currentTarget.style.borderColor='#e53935';}}
                         onMouseOut={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.borderColor='#2563eb';}}
                         onClick={()=>eliminarSolicitud(servicio.id)}
                       >Eliminar</button>
                       <div style={{display:'flex', alignItems:'center', gap:8}}>
                         <div style={{display:'flex', alignItems:'center'}}><b>{servicio.servicio_nombre}</b> <span style={{color:'#2563eb', marginLeft:6}}>{quienTexto}</span></div>
                         {renderEstadoBadge(servicio.estado)}
                       </div>
                       <div style={{fontSize:13, color:'#555'}}>Solicitado el {servicio.fecha_solicitud?.slice(0,10)}</div>
                       <div style={{fontSize:13, color:'#555'}}>Detalles: {servicio.detalles}</div>
                       {/* Mostrar dirección provista por el comprador si existe (vista vendedor) */}
                       {(servicio.direccion || servicio.barrio || servicio.ciudad || servicio.ciudad_nombre) && (
                         <div style={{fontSize:13, color:'#555', marginTop:6}}>
                           <b>Dirección:</b> {servicio.direccion || '—'}{servicio.barrio ? `, Barrio ${servicio.barrio}` : ''}{(servicio.ciudad_nombre || servicio.ciudad) ? `, ${servicio.ciudad_nombre || servicio.ciudad}` : ''}
                         </div>
                       )}
                       {/* Negociación UI */}
                       {servicio.estado === 'pendiente' || servicio.estado === 'negociacion' ? (
                         <div style={{marginTop:10}}>
                           {/* Si soy vendedor, puedo proponer nueva fecha/hora */}
                           {!modoCompras && (
                             <form style={{display:'flex',gap:8,alignItems:'center'}} onSubmit={e=>{e.preventDefault();handleNegociar(servicio.id, negociandoActual.fecha, negociandoActual.hora);}}>
                               <span style={{fontSize:13}}>Proponer nueva fecha/hora:</span>
                               <input type="date" value={negociandoActual.fecha} onChange={e=>setNegociando(prev=>({...prev,[servicio.id]:{...negociandoActual,fecha:e.target.value}}))} required style={{fontSize:13}} />
                               <input type="time" value={negociandoActual.hora} onChange={e=>setNegociando(prev=>({...prev,[servicio.id]:{...negociandoActual,hora:e.target.value}}))} required style={{fontSize:13}} />
                               <button type="submit" style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:4,padding:'6px 14px'}}>Negociar</button>
                             </form>
                           )}
                           {/* Si soy comprador y hay propuesta del vendedor */}
                           {modoCompras && servicio.fecha_propuesta && servicio.hora_propuesta && servicio.ultima_propuesta_por==='vendedor' && (
                             <div style={{marginTop:8}}>
                               <span style={{fontSize:13}}>El vendedor propone: <b>{servicio.fecha_propuesta}</b> a las <b>{servicio.hora_propuesta}</b></span>
                               <button onClick={()=>handleAceptarPropuesta(servicio.id)} style={{marginLeft:12,background:'#388e3c',color:'#fff',border:'none',borderRadius:4,padding:'6px 14px'}}>Aceptar propuesta</button>
                             </div>
                           )}
                         </div>
                       ) : null}
                       <div style={{marginTop:8, display:'flex', gap:8}}>
                         {!modoCompras && <button onClick={()=>aceptarServicio(servicio.id)} style={{background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px'}} disabled={servicio.estado!=='pendiente'}>Aceptar</button>}
                         {!modoCompras && <button onClick={()=>rechazarServicio(servicio.id)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px'}} disabled={servicio.estado!=='pendiente'}>Rechazar</button>}
                         {/* Badge de estado (reemplaza la etiqueta textual anterior) */}
                         {renderEstadoBadge(servicio.estado)}
                       </div>
                       <div style={{marginTop:12}}>
                         <AgendaServicioFechas fechas={servicio.fecha && servicio.hora ? [{fecha: servicio.fecha, hora: servicio.hora}] : []} />
                       </div>
                       {/* Area de calificación para comprador cuando el servicio fue aceptado */}
                       {puedeCalificarServicio && (
                         <div style={{marginTop:8}}>
                           <div style={{fontWeight:700, marginBottom:6}}>Califica el servicio</div>
                           <Estrellas value={calificacionServicio} onChange={valor => calificarServicio(servicio, valor)} size={28} readOnly={!puedeCalificarServicio} />
                         </div>
                       )}
                     </div>
                   );
                 })}
              </div>
            </div>
          )}
          {!modoCompras && (
            <>
              <h3 style={{marginTop:32}}>Productos vendidos</h3>
              {productos.length === 0 ? (
                <div style={{color:'#888'}}>No tienes productos vendidos.</div>
              ) : (
                productos.map(producto => (
                  <div key={producto.id} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#fff'}}>
                    <div><b>{producto.nombre}</b> vendido a <span style={{color:'#2563eb'}}>{producto.comprador}</span></div>
                    <div style={{fontSize:13, color:'#555'}}>Fecha de venta: {producto.fechaVenta}</div>
                    <div style={{fontSize:13, color:'#555'}}>Precio: $ {producto.precio?.toLocaleString()}</div>
                    {/* Botón para marcar como enviado solo si es contraentrega y no enviado */}
                    {producto.metodo === 'contraentrega' && !producto.enviado && (
                      <button
                        style={{marginTop:8, background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px'}}
                        onClick={async () => {
                          try {
                            await require('../api/ventas').marcarPedidoItemEnviado(producto.id);
                            // Actualizar estado local
                            setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, enviado: true } : p));
                            // recalcular notificaciones globales para comprador
                            if (typeof setNotifsGlobal === 'function') {
                              const usuarioLocal = JSON.parse(localStorage.getItem('usuario_data') || '{}');
                              calcularNotificaciones && calcularNotificaciones(usuarioLocal).then(n => {
                                if (n && n.notifKey) localStorage.setItem('ultima_notif_key', n.notifKey);
                                setNotifsGlobal && setNotifsGlobal(n);
                              }).catch(()=>{});
                            }
                          } catch {
                            alert('Error al marcar como enviado');
                          }
                        }}
                      >Marcar como Enviado</button>
                    )}
                    {producto.metodo === 'contraentrega' && producto.enviado && (
                      <div style={{fontSize:13, color:'#388e3c', marginTop:8}}>Producto marcado como enviado</div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Ventas;
