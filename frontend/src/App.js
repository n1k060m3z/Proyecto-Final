import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Cart from './pages/Cart';
import CheckoutLayout from './pages/checkout/CheckoutLayout';
import CheckoutEnvio from './pages/checkout/CheckoutEnvio';
import CheckoutPago from './pages/checkout/CheckoutPago';
import CheckoutResumen from './pages/checkout/CheckoutResumen';
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
import EditarPublicacion from './pages/EditarPublicacion'; // Importación añadida
import ProductoDetalle from './pages/ProductoDetalle'; // Asegúrate de importar ProductoDetalle si no está importado
import ProductosVendedor from './pages/ProductosVendedor';
import { calcularNotificaciones } from './api/notificaciones';
import Estrellas from './components/Estrellas';

function App() {
  // Estado global reactivo
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [esVendedor, setEsVendedor] = useState(localStorage.getItem('es_vendedor') === 'true' || localStorage.getItem('es_vendedor') === true);
  const [notifs, setNotifs] = useState({ perfil: false, compras: false, ventas: false });
  const notifsRef = useRef(notifs);
  notifsRef.current = notifs;

  // Función para actualizar notificaciones desde Perfil (memorizada)
  const handleSetNotifs = useCallback(n => {
    setNotifs(n);
    notifsRef.current = n;
  }, []);

  // Hook para obtener la ubicación actual
  const location = window.location;

  // Calcular notificaciones globales al montar la app y cada vez que cambie la ruta o el token
  useEffect(() => {
    async function actualizarNotifs() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:8000/api/perfil/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) return;
          const usuario = await res.json();
          // Guardar usuario en localStorage para uso por componentes de checkout y otros
          try {
            const usuarioData = {
              id: usuario.id,
              nombre: usuario.username || usuario.nombre || '',
              correo: usuario.email || usuario.correo || '',
              telefono: usuario.telefono || '',
              direccion: usuario.direccion || '',
              ciudad: usuario.city || usuario.ciudad || '',
              barrio: usuario.barrio || ''
            };
            localStorage.setItem('usuario_data', JSON.stringify(usuarioData));
            localStorage.setItem('usuario', usuario.username || usuarioData.nombre || '');
            localStorage.setItem('es_vendedor', usuario.es_vendedor ? 'true' : 'false');
          } catch (e) {
            console.log('DEBUG error guardando usuario_data en localStorage', e);
          }

          const n = await calcularNotificaciones(usuario);
          console.log('DEBUG notifs calculadas:', n, 'usuario:', usuario);
          // Si la respuesta incluye notifKey, persistir en localStorage
          const notifKey = n && n.notifKey ? n.notifKey : null;
          if (notifKey) localStorage.setItem('ultima_notif_key', notifKey);
          // Tener en cuenta si el usuario ya marcó la notificación como vista por sección
          const userId = usuario && usuario.id ? usuario.id : null;
          const vistoPerfil = userId ? (localStorage.getItem(`notificacionVista_perfil_${userId}`) === notifKey) : false;
          const vistoCompras = userId ? (localStorage.getItem(`notificacionVista_compras_${userId}`) === notifKey) : false;
          const vistoVentas = userId ? (localStorage.getItem(`notificacionVista_ventas_${userId}`) === notifKey) : false;
          const adjusted = {
            perfil: !!notifKey && !vistoPerfil,
            compras: !!(n && n.compras) && !vistoCompras,
            ventas: !!(n && n.ventas) && !vistoVentas,
            notifKey
          };
          setNotifs(adjusted);
          notifsRef.current = adjusted;
        } catch (e) {
          console.log('DEBUG error notifs:', e);
        }
      } else {
        setNotifs({ perfil: false, compras: false, ventas: false });
        notifsRef.current = { perfil: false, compras: false, ventas: false };
      }
    }
    actualizarNotifs();
  }, [window.location.pathname, localStorage.getItem('token')]);

  console.log('isAuthenticated:', isAuthenticated, 'esVendedor:', esVendedor, 'token:', localStorage.getItem('token'));

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} esVendedor={esVendedor} setIsAuthenticated={setIsAuthenticated} setEsVendedor={setEsVendedor} notifs={notifs} notifGlobal={notifs.perfil || notifs.compras || notifs.ventas} />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="App">
        <div className="main-content">
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
            {/* Checkout anidado */}
            <Route path="/checkout" element={isAuthenticated ? <CheckoutLayout /> : <Navigate to="/iniciar-sesion" replace /> }>
              <Route index element={<CheckoutEnvio />} />
              <Route path="envio" element={<CheckoutEnvio />} />
              <Route path="pago" element={<CheckoutPago />} />
              <Route path="resumen" element={<CheckoutResumen />} />
            </Route>
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
            <Route path="/editar-publicacion/:id" element={<EditarPublicacion />} />
            {/* Rutas de búsqueda */}
            <Route path="/buscar" element={<Busqueda />} />
            <Route path="/buscar/:categoriaId" element={<Busqueda />} />
            <Route path="/buscar/:categoriaId/:subcategoriaId" element={<Busqueda />} />
            {/* Detalle de producto */}
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            {/* Perfil y configuración */}
            <Route path="/perfil" element={isAuthenticated ? <Perfil setNotifs={handleSetNotifs} /> : <Navigate to="/iniciar-sesion" replace />} />
            <Route path="/configuracion" element={isAuthenticated ? <Configuracion /> : <Navigate to="/iniciar-sesion" replace />} />
            {/* Ruta para productos de vendedor */}
            <Route path="/vendedor/:vendedorId" element={<ProductosVendedor />} />
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
