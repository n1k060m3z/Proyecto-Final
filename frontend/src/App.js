import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Cart from './pages/Cart';
import ResumenPedido from './pages/ResumenPedido'; // ✅ NUEVO
import SellerDashboard from './pages/SellerDashboard';
import ProductForm from './pages/ProductForm';
import Navbar from './components/Navbar';
import './App.css';
import CatBar from './components/cat';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const esVendedor = localStorage.getItem('es_vendedor') === 'true';

  return (
    <Router>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Rutas públicas */}
        <Route
          path="/iniciar-sesion"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/registro"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
        />

        {/* Rutas privadas */}
        <Route
          path="/carrito"
          element={isAuthenticated ? <Cart /> : <Navigate to="/iniciar-sesion" replace />}
        />
        <Route
          path="/resumen-pedido"
          element={isAuthenticated ? <ResumenPedido /> : <Navigate to="/iniciar-sesion" replace />}
        />

        {/* Rutas para vendedores */}
        <Route
          path="/vendedor"
          element={
            isAuthenticated && esVendedor ? <SellerDashboard /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/vendedor/nuevo"
          element={
            isAuthenticated && esVendedor ? <ProductForm /> : <Navigate to="/" replace />
          }
        />

        {/* Ruta fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
