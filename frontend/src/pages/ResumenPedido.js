// src/pages/ResumenPedido.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiFillCheckSquare } from "react-icons/ai";
import api from '../api/axios';

function ResumenPedido() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({ items: [], total: 0 });
  const [datosUsuario, setDatosUsuario] = useState({});
  const [metodoPago, setMetodoPago] = useState('');

  useEffect(() => {
    if (location.state && location.state.items) {
      setResumen({ items: location.state.items, total: location.state.total });
      localStorage.setItem('ultimo_resumen_pedido', JSON.stringify(location.state));
    } else {
      const resumenLS = JSON.parse(localStorage.getItem('ultimo_resumen_pedido') || '{"items":[],"total":0}');
      setResumen(resumenLS);

      // Priorizar datos del resumen guardado (incluye entrega y metodo)
      if (resumenLS && resumenLS.entrega && Object.keys(resumenLS.entrega).length > 0) {
        setDatosUsuario(resumenLS.entrega);
      } else {
        // Si no hay datos en localStorage, intentar obtener el último pedido del backend
        const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        // Primero intentar usar usuario_data si existe
        if (usuario && Object.keys(usuario).length > 0) {
          setDatosUsuario(usuario);
        }
        // Luego intentar fallback al backend para obtener el último pedido
        (async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await api.get('pedido/cliente/', { headers: { Authorization: `Bearer ${token}` } });
            const pedidos = Array.isArray(res.data) ? res.data : (res.data.items || []);
            if (pedidos && pedidos.length > 0) {
              const ultimo = pedidos[0]; // el endpoint devuelve ya ordenado por creado desc en el backend
              // Usar los campos de entrega expuestos por el serializer
              const entrega = {
                nombre: ultimo.entrega_nombre || '',
                correo: ultimo.entrega_correo || ultimo.usuario_username || '',
                telefono: ultimo.entrega_telefono || '',
                direccion: ultimo.entrega_direccion || '',
                ciudad: ultimo.entrega_ciudad || '',
                barrio: ultimo.entrega_barrio || ''
              };
              setDatosUsuario(entrega);
              setMetodoPago(ultimo.metodo_pago || '');
              // También guardar en localStorage para siguientes vistas
              const resumenBackend = { items: ultimo.items || [], total: ultimo.total || 0, entrega, metodo: ultimo.metodo_pago || '' };
              localStorage.setItem('ultimo_resumen_pedido', JSON.stringify(resumenBackend));
              setResumen(resumenBackend);
            }
          } catch (e) {
            // Silenciar errores; la UI seguirá mostrando usuario_data si la hay
            console.log('DEBUG: no se pudo obtener pedido cliente para resumen fallback', e);
          }
        })();
      }
    }
  }, [location.state]);

  // Helper para leer campos preferiendo datosUsuario, sino localStorage, sino usuario_data
  const getCampo = (campo) => {
    if (datosUsuario && datosUsuario[campo]) return datosUsuario[campo];
    try {
      const ultimo = JSON.parse(localStorage.getItem('ultimo_resumen_pedido') || 'null');
      if (ultimo && ultimo.entrega && ultimo.entrega[campo]) return ultimo.entrega[campo];
    } catch (e) {
      // ignore
    }
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
      if (usuario && usuario[campo]) return usuario[campo];
    } catch (e) {}
    return '';
  };

  const volver = () => {
    navigate('/');
  };

  return (
    <div style={{ background: '#fff', color: '#000', minHeight: '100vh', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AiFillCheckSquare size={80} color="#2979ff" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>¡Compra realizada con éxito!</h2>
      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 24, maxWidth: 500, width: '100%', marginBottom: 24, boxShadow: '0 2px 8px #ddd' }}>
        <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Resumen de Pedido</h3>
        {resumen.items.length === 0 ? (
          <p>No hay productos para mostrar.</p>
        ) : (
          <>
            <div style={{ borderBottom: '1px solid #ddd', marginBottom: 12 }}>
              {resumen.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.producto?.nombre || item.nombre || 'Producto'}</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>x{item.cantidad}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>${((item.producto?.precio ?? item.precio ?? 0) * item.cantidad).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 20 }}>
              Total a pagar: ${resumen.total.toLocaleString()}
            </div>
          </>
        )}
      </div>
      <div style={{ background: '#2979ff', color: '#fff', borderRadius: 12, padding: 20, maxWidth: 500, width: '100%', marginBottom: 24, boxShadow: '0 2px 8px #ddd' }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Datos de la compra</h3>
        <div style={{ fontSize: 16, lineHeight: 1.7 }}>
          <div><b>Nombre:</b> {getCampo('nombre') || '-'}</div>
          <div><b>Correo:</b> {getCampo('correo') || '-'}</div>
          <div><b>Teléfono:</b> {getCampo('telefono') || '-'}</div>
          <div><b>Ciudad:</b> {getCampo('ciudad') || '-'}</div>
          <div><b>Dirección:</b> {getCampo('direccion') || '-'}</div>
          <div><b>Método de pago:</b> {metodoPago ? metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1) : (JSON.parse(localStorage.getItem('ultimo_resumen_pedido') || '{}').metodo || '-')}</div>
        </div>
      </div>
      <button
        onClick={volver}
        style={{ background: '#2979ff', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default ResumenPedido;
