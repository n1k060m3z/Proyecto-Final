import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './style/navbar.css';

export default function Navbar({ isAuthenticated, esVendedor, setIsAuthenticated, setEsVendedor }) {
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('usuario');
    setUsuario(nombreGuardado);
    setMenuAbierto(false);
  }, [location, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('es_vendedor');
    setUsuario(null);
    setIsAuthenticated(false);
    setEsVendedor(false);
    navigate('/iniciar-sesion');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FourShop
      </Link>
      <form
        onSubmit={e => {
          e.preventDefault();
          const value = e.target.elements.search.value.trim();
          if (value) navigate(`/buscar?q=${encodeURIComponent(value)}`);
        }}
        style={{ display: 'inline-block', margin: '0 16px' }}
      >
        <input
          name="search"
          type="text"
          placeholder="Buscar productos..."
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #2563eb', width: 180, background: '#e3eafe', color: '#222', fontSize: 16, fontWeight: 500 }}
        />
        <button type="submit" style={{ padding: '6px 12px', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', marginLeft: 4, fontWeight: 600 }}>
          Buscar
        </button>
      </form>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Inicio</Link>

        {!usuario ? (
          <>
            <Link to="/iniciar-sesion" className="hover:underline">Iniciar sesión</Link>
            <Link to="/registro" className="hover:underline">Registro</Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="user-btn hover:underline focus:outline-none"
            >
              <FaUserCircle className="text-2xl" />
              <span>{usuario}</span>
            </button>

            {menuAbierto && (
              <div className="user-menu">
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                >
                  Mi perfil
                </Link>
                {esVendedor && (
                  <Link
                    to="/publicaciones"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mis publicaciones
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}

        <Link to="/carrito" className="hover:underline">Carrito</Link>

        {/* Solo mostrar si es vendedor */}
        {usuario && esVendedor && (
          <Link to="/vendedor/nuevo" className="hover:underline">Vender</Link>
        )}
      </div>
    </nav>
  );
}
