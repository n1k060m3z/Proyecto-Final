import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Volver from '../../components/Volver';

const metodos = [
  { id: 'debito', label: 'Nueva tarjeta de débito' },
  { id: 'credito', label: 'Nueva tarjeta de crédito' },
  { id: 'pse', label: 'Transferencia con PSE' },
  { id: 'efecty', label: 'Efecty' },
];

const CheckoutPago = () => {
  const [seleccion, setSeleccion] = useState(metodos[0].id);
  const navigate = useNavigate();

  const handleConfirmar = () => {
    // Aquí podrías llamar a la API para finalizar la compra
    navigate('/resumen-pedido');
  };

  return (
    <div>
      <Volver />
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Elige cómo pagar</h2>
      <div style={{ marginBottom: 24 }}>
        {metodos.map(metodo => (
          <div key={metodo.id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 18, display: 'flex', alignItems: 'center', background: '#fafbfc' }}>
            <input
              type="radio"
              name="pago"
              checked={seleccion === metodo.id}
              onChange={() => setSeleccion(metodo.id)}
              style={{ marginRight: 16 }}
            />
            <div style={{ fontWeight: 600 }}>{metodo.label}</div>
          </div>
        ))}
      </div>
      <button onClick={handleConfirmar} style={{ background: '#2979ff', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>
        Confirmar compra
      </button>
    </div>
  );
};

export default CheckoutPago;
