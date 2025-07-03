// src/pages/ResumenPedido.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResumenPedido() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], total = 0 } = location.state || {};

  const volver = () => {
    navigate('/');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Resumen de Pedido</h2>

      {items.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="font-semibold">{item.producto?.nombre}</p>
                  <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                </div>
                <p className="font-semibold">${(item.producto?.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right font-bold text-xl">
            Total a pagar: ${total.toFixed(2)}
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={volver}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ResumenPedido;
