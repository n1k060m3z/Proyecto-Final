import React from 'react';
import AgendaServicio from '../components/AgendaServicio';

const OpcionesServicio = ({ producto }) => {
  return (
    <div className="opciones-servicio" style={{ background: '#f9f9f9', borderRadius: 8, padding: 24, margin: '32px 0' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Opciones para servicios</h2>
      <ul style={{ marginBottom: 20 }}>
        <li>Recibir solicitudes de contratación de servicios.</li>
        <li>Aceptar o rechazar solicitudes de servicios.</li>
        <li>Consultar su historial de venta de sus servicios.</li>
      </ul>
      <AgendaServicio producto={producto} />
    </div>
  );
};

export default OpcionesServicio;
