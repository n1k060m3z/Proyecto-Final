import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style/volver.css';

const Volver = ({ to = -1, children = 'Volver' }) => {
  const navigate = useNavigate();
  return (
    <button className="volver-btn" onClick={() => navigate(to)}>
      <span className="volver-icon">&lt;</span> {children}
    </button>
  );
};

export default Volver;
