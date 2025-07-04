import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './style/navbar.css';

export default function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [esVendedor, setEsVendedor] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const nombreGuardado = localStorage.getItem('usuario');
    const vendedorFlag = localStorage.getItem('es_vendedor') === 'true';
    setUsuario(nombreGuardado);
    setEsVendedor(vendedorFlag);
    setMenuAbierto(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('es_vendedor');
    setUsuario(null);
    setEsVendedor(false);
    navigate('/iniciar-sesion');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FourShop
      </Link>
      <input></input>
      <button></button>
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
          <Link to="/vendedor" className="hover:underline">Vendedor</Link>
        )}
      </div>
    </nav>
  );
}
