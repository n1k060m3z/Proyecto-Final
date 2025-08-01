import React from 'react';
import Volver from '../../components/Volver';

const CheckoutResumen = () => (
  <div>
    <Volver to="/" >Ir al inicio</Volver>
    <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>¡Compra realizada con éxito!</h2>
    <p>Gracias por tu compra. Pronto recibirás un correo con los detalles y el seguimiento de tu pedido.</p>
  </div>
);

export default CheckoutResumen;
