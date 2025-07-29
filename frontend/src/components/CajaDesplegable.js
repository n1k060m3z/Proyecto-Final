import React, { useState } from 'react';
import '../components/style/cajaDesplegable.css';

const CajaDesplegable = ({ titulo, children, defaultOpen = true }) => {
  const [abierto, setAbierto] = useState(defaultOpen);

  return (
    <div className={`caja-desplegable${abierto ? ' abierta' : ''}`}> 
      <div className="caja-desplegable-titulo" onClick={() => setAbierto(a => !a)}>
        <span className={`caja-desplegable-flecha${abierto ? ' abierta' : ''}`}>{abierto ? '▼' : '▶'}</span>
        {titulo}
      </div>
      {abierto && <div className="caja-desplegable-contenido">{children}</div>}
    </div>
  );
};

export default CajaDesplegable;
