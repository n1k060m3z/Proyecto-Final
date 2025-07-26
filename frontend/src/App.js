import React, { useState } from 'react';
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
import Footer from './components/Footer';
import './App.css';
import CatBar from './components/cat';
import Busqueda from './pages/Busqueda';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import Publicaciones from './pages/Publicaciones';
import ProductoDetalle from './pages/ProductoDetalle';

function App() {
  // Estado global reactivo
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [esVendedor, setEsVendedor] = useState(localStorage.getItem('es_vendedor') === 'true' || localStorage.getItem('es_vendedor') === true);

  console.log('isAuthenticated:', isAuthenticated, 'esVendedor:', esVendedor, 'token:', localStorage.getItem('token'));

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} esVendedor={esVendedor} setIsAuthenticated={setIsAuthenticated} setEsVendedor={setEsVendedor} />
      <Toaster position="top-center" reverseOrder={false} />
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Rutas públicas */}
            <Route
              path="/iniciar-sesion"
              element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setEsVendedor={setEsVendedor} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/registro"
              element={!isAuthenticated ? <Register setIsAuthenticated={setIsAuthenticated} setEsVendedor={setEsVendedor} /> : <Navigate to="/" replace />}
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
            {/* Página de publicaciones para vendedores */}
            <Route
              path="/publicaciones"
              element={isAuthenticated && esVendedor ? <Publicaciones /> : <Navigate to="/" replace />}
            />
            {/* Rutas de búsqueda */}
            <Route path="/buscar" element={<Busqueda />} />
            <Route path="/buscar/:categoriaId" element={<Busqueda />} />
            <Route path="/buscar/:categoriaId/:subcategoriaId" element={<Busqueda />} />
            {/* Detalle de producto */}
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            {/* Perfil y configuración */}
            <Route path="/perfil" element={isAuthenticated ? <Perfil /> : <Navigate to="/iniciar-sesion" replace />} />
            <Route path="/configuracion" element={isAuthenticated ? <Configuracion /> : <Navigate to="/iniciar-sesion" replace />} />
            {/* Ruta fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
