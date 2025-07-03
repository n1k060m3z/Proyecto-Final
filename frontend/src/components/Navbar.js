import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

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
    <nav className="bg-orange-500 px-4 py-3 shadow-md flex justify-between items-center text-white relative">
      <Link to="/" className="text-xl font-bold hover:underline">
        FourShop
      </Link>

      <div className="space-x-4 flex items-center">
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
              className="flex items-center gap-1 hover:underline focus:outline-none"
            >
              <FaUserCircle className="text-2xl" />
              <span>{usuario}</span>
            </button>

            {menuAbierto && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-md z-10 w-40">
                <Link
                  to="/perfil"
                  className="block px-4 py-2 hover:bg-gray-200"
                  onClick={() => setMenuAbierto(false)}
                >
                  Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
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
