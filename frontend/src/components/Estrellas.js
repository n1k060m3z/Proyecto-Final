import React, { useState } from "react";

const colorActivo = "#FFD700"; // Amarillo-dorado
const colorInactivo = "#e0e0e0";

/**
 * Componente de calificación por estrellas (1-5) personalizado con SVG
 * Props:
 *  - value: número de estrellas seleccionadas (opcional, para control externo)
 *  - onChange: función(valor) llamada al seleccionar una estrella
 *  - size: tamaño de las estrellas (px)
 *  - readOnly: si es true, solo muestra la calificación
 */
const Estrellas = ({ value = 0, onChange, size = 32, readOnly = false }) => {
  const [hoverValue, setHoverValue] = useState(null);
  // Genera un array de 5 posiciones para las estrellas
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', gap: 4, cursor: readOnly ? 'default' : 'pointer', filter: readOnly ? 'grayscale(0.2)' : 'none' }}>
      {stars.map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= (hoverValue !== null ? hoverValue : value) ? colorActivo : colorInactivo}
          stroke="#bfa900"
          strokeWidth="0.5"
          style={{ transition: 'fill 0.2s' }}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseOver={() => { if (!readOnly) setHoverValue(star); }}
          onMouseOut={() => { if (!readOnly) setHoverValue(null); }}
        >
          <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18.5 5.5,22 7,14.5 2,9.5 9,9" />
        </svg>
      ))}
    </div>
  );
};

export default Estrellas;
