import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Volver from '../../components/Volver';

const opcionesEnvio = [
  {
    id: 'domicilio',
    label: 'Enviar a domicilio',
    descripcion: 'Calle 39 #SN-SN - Popular, Valle Del Cauca',
    precio: 12300,
    detalle: 'Residencial',
  },
  {
    id: 'punto',
    label: 'Retiro en un punto de entrega',
    descripcion: 'Agencia Mercado Libre - CASCOS LA PAISA - CARRERA 39 34-198 - Ciudad Modelo',
    precio: 12300,
    detalle: 'Lu a Sá: 8:30 a 18 hs. Do: 9:30 a 13 hs.',
  },
];

const CheckoutEnvio = ({ setMetodoEnvio }) => {
  const [seleccion, setSeleccion] = useState(opcionesEnvio[0].id);
  const navigate = useNavigate();

  const handleContinuar = () => {
    if (setMetodoEnvio) setMetodoEnvio(seleccion);
    navigate('/checkout/pago');
  };

  return (
    <div>
      <Volver />
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Revisa la forma de entrega</h2>
      {opcionesEnvio.map(op => (
        <div key={op.id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 16, padding: 20, display: 'flex', alignItems: 'center', background: '#fafbfc' }}>
          <input
            type="radio"
            name="envio"
            checked={seleccion === op.id}
            onChange={() => setSeleccion(op.id)}
            style={{ marginRight: 16 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{op.label}</div>
            <div style={{ color: '#555', fontSize: 15 }}>{op.descripcion}</div>
            <div style={{ color: '#888', fontSize: 14 }}>{op.detalle}</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>${op.precio.toLocaleString()}</div>
        </div>
      ))}
      <button onClick={handleContinuar} style={{ marginTop: 24, background: '#2979ff', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>
        Continuar
      </button>
    </div>
  );
};

export default CheckoutEnvio;
