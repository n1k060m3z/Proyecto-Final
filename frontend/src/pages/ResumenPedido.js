// src/pages/ResumenPedido.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiFillCheckSquare } from "react-icons/ai";

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
    }

    // Cargar datos del usuario y método de pago
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    if (compras.length > 0) {
      const ultima = compras[compras.length - 1];
      setMetodoPago(ultima.metodo || '');
      // Si hay datos digitados en la compra, usarlos
      if (ultima.datosEntrega && Object.keys(ultima.datosEntrega).length > 0) {
        setDatosUsuario(ultima.datosEntrega);
      } else {
        const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        setDatosUsuario(usuario);
      }
    } else {
      const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
      setDatosUsuario(usuario);
    }
  }, [location.state]);

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
          <div><b>Nombre:</b> {datosUsuario.nombre || '-'}</div>
          <div><b>Correo:</b> {datosUsuario.correo || '-'}</div>
          <div><b>Teléfono:</b> {datosUsuario.telefono || '-'}</div>
          <div><b>Ciudad:</b> {datosUsuario.ciudad || '-'}</div>
          <div><b>Dirección:</b> {datosUsuario.direccion || '-'}</div>
          <div><b>Método de pago:</b> {metodoPago ? metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1) : '-'}</div>
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
