import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './style/navbar-new.css';

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
        className="navbar-search-form"
        autoComplete="off"
        style={{ flex: 1, maxWidth: 600, margin: '0 32px' }}
      >
        <input
          name="search"
          type="text"
          placeholder="Buscar productos, marcas y más..."
          className="navbar-search-input"
          autoComplete="off"
        />
        <button type="submit" className="navbar-search-btn" tabIndex={-1} aria-label="Buscar">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7.5" stroke="#888" strokeWidth="2"/>
            <line x1="16.0607" y1="16.4749" x2="20" y2="20.4142" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
          </svg>
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
