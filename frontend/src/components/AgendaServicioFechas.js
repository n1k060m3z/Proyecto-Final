import React from 'react';

const AgendaServicioFechas = ({ fechas }) => {
  if (!fechas || fechas.length === 0) return null;
  return (
    <div className="agenda-servicio">
      <h3>Agenda de Disponibilidad</h3>
      <ul>
        {fechas.map((item, idx) => (
          <li key={idx}>
            <b>{item.fecha}:</b> {item.hora}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaServicioFechas;
