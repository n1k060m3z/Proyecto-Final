import React, { useEffect, useState } from 'react';
import AgendaServicio from './AgendaServicio';
import { getSolicitudesServicio, updateSolicitudServicio, getProductosVendidos } from '../api/ventas';

const Ventas = () => {
  const [serviciosEnNegociacion, setServiciosEnNegociacion] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const solicitudes = await getSolicitudesServicio();
        setServiciosEnNegociacion(solicitudes);
        // Aquí deberías obtener los productos vendidos reales
        // const productos = await getProductosVendidos();
        // setProductosVendidos(productos);
        setProductosVendidos([]); // Temporal, hasta tener endpoint real
      } catch {
        setServiciosEnNegociacion([]);
        setProductosVendidos([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const aceptarServicio = async (id) => {
    await updateSolicitudServicio(id, 'aceptado');
    setServiciosEnNegociacion(prev => prev.map(s => s.id === id ? { ...s, estado: 'aceptado' } : s));
  };
  const rechazarServicio = async (id) => {
    await updateSolicitudServicio(id, 'rechazado');
    setServiciosEnNegociacion(prev => prev.map(s => s.id === id ? { ...s, estado: 'rechazado' } : s));
  };

  if (loading) return <div>Cargando ventas...</div>;

  return (
    <div>
      <h3 style={{marginTop: 0}}>Servicios en negociación</h3>
      {serviciosEnNegociacion.length === 0 ? (
        <div style={{color:'#888'}}>No tienes servicios en negociación.</div>
      ) : (
        serviciosEnNegociacion.map(servicio => (
          <div key={servicio.id} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#f9f9f9'}}>
            <div><b>{servicio.servicio_nombre}</b> para <span style={{color:'#2563eb'}}>{servicio.cliente_nombre}</span></div>
            <div style={{fontSize:13, color:'#555'}}>Solicitado el {servicio.fecha_solicitud?.slice(0,10)}</div>
            <div style={{fontSize:13, color:'#555'}}>Detalles: {servicio.detalles}</div>
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <button onClick={()=>aceptarServicio(servicio.id)} style={{background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px'}} disabled={servicio.estado!=='pendiente'}>Aceptar</button>
              <button onClick={()=>rechazarServicio(servicio.id)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px'}} disabled={servicio.estado!=='pendiente'}>Rechazar</button>
              <span style={{marginLeft:12, color:servicio.estado==='aceptado'?'#388e3c':servicio.estado==='rechazado'?'#e53935':'#888'}}>{servicio.estado}</span>
            </div>
            <div style={{marginTop:12}}>
              <AgendaServicio producto={servicio} />
            </div>
          </div>
        ))
      )}
      <h3 style={{marginTop:32}}>Productos vendidos</h3>
      {productosVendidos.length === 0 ? (
        <div style={{color:'#888'}}>No tienes productos vendidos.</div>
      ) : (
        productosVendidos.map(producto => (
          <div key={producto.id} style={{border:'1px solid #e3e3e3', borderRadius:8, padding:16, marginBottom:16, background:'#fff'}}>
            <div><b>{producto.nombre}</b> vendido a <span style={{color:'#2563eb'}}>{producto.comprador}</span></div>
            <div style={{fontSize:13, color:'#555'}}>Fecha de venta: {producto.fechaVenta}</div>
            <div style={{fontSize:13, color:'#555'}}>Precio: $ {producto.precio?.toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default Ventas;
