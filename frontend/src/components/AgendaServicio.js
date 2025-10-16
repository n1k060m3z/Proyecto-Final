import React, { useState } from 'react';

const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const AgendaServicio = ({ producto }) => {
  // Estado local para simular la agenda (en el futuro se conectará al backend)
  const [disponibilidad, setDisponibilidad] = useState([
    { dia: 'Lunes', horas: ['10:00', '14:00'] },
    { dia: 'Miércoles', horas: ['16:00'] },
  ]);
  const [nuevoDia, setNuevoDia] = useState('Lunes');
  const [nuevaHora, setNuevaHora] = useState('08:00');

  // Agregar disponibilidad con selección de día y hora
  const agregarDisponibilidad = (e) => {
    e.preventDefault();
    // Buscar si ya existe el día
    const idx = disponibilidad.findIndex(d => d.dia === nuevoDia);
    if (idx !== -1) {
      // Si el día existe, agregar la hora si no está repetida
      if (!disponibilidad[idx].horas.includes(nuevaHora)) {
        const nuevaDisp = [...disponibilidad];
        nuevaDisp[idx].horas.push(nuevaHora);
        setDisponibilidad(nuevaDisp);
      }
    } else {
      // Si el día no existe, agregarlo
      setDisponibilidad([...disponibilidad, { dia: nuevoDia, horas: [nuevaHora] }]);
    }
  };

  return (
    <div className="agenda-servicio">
      <h3>Agenda de Disponibilidad</h3>
      <ul>
        {disponibilidad.map((slot, idx) => (
          <li key={idx}>
            <b>{slot.dia}:</b> {slot.horas.join(', ')}
          </li>
        ))}
      </ul>
      <form onSubmit={agregarDisponibilidad} style={{display:'flex',gap:8,alignItems:'center',marginTop:12}}>
        <label>Día:
          <select value={nuevoDia} onChange={e => setNuevoDia(e.target.value)} style={{marginLeft:4}}>
            {diasSemana.map(dia => <option key={dia} value={dia}>{dia}</option>)}
          </select>
        </label>
        <label>Hora:
          <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} style={{marginLeft:4}} required />
        </label>
        <button type="submit" className="btn-agenda">Agregar disponibilidad</button>
      </form>
    </div>
  );
};

export default AgendaServicio;
