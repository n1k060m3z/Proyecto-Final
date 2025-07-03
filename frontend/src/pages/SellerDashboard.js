import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function SellerDashboard() {
  return (
    <div className="seller-dashboard">
      <h2>Panel del Vendedor</h2>
      <Link to="/seller/new" className="btn">Agregar Nuevo Producto</Link>
    </div>
  );
}

export default SellerDashboard;
