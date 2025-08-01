// ...existing code...

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import "./style/cat.css";

const CatBar = () => {
  const [categorias, setCategorias] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRefs = useRef({});

  useEffect(() => {
    axios.get("http://localhost:8000/api/categorias/")
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  const handleMouseEnter = (catId) => {
    setHovered(catId);
    setActiveDropdown(catId);
    // Calcular posición del botón
    const btn = btnRefs.current[catId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Control para evitar que el menú desaparezca al mover rápido el mouse
  const leaveTimeout = useRef();
  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setHovered(null);
      setActiveDropdown(null);
    }, 220);
  };
  const handleMouseEnterAny = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
  };

  const handleDropdownMouseEnter = () => {
    setActiveDropdown(hovered);
  };

  const handleSubcategoryClick = (subcategoria, categoria) => {
    window.location.href = `/buscar/${categoria.id}/${subcategoria.id}`;
  };

  const handleMainCategoryClick = (categoria) => {
    if (!categoria.subcategorias || categoria.subcategorias.length === 0) {
      window.location.href = `/buscar/${categoria.id}`;
    }
  };

  return (
    <div className="cat-bar-bg">
      <div className="cat-bar-container">
        <div className="cat-bar-scroll scrollbar-hide">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="cat-bar-dropdown"
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnterAny}
            >
              <button
                ref={el => btnRefs.current[cat.id] = el}
                className={`cat-bar-btn${hovered === cat.id ? ' cat-bar-btn-active' : ''}`}
                data-category-id={cat.id}
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onClick={() => handleMainCategoryClick(cat)}
              >
                {cat.nombre}
                {cat.subcategorias && cat.subcategorias.length > 0 && (
                  <ChevronDown
                    size={18}
                    className={activeDropdown === cat.id ? 'cat-bar-chevron-rotated' : ''}
                  />
                )}
              </button>
            </div>
          ))}
        </div>
        {/* Submenú flotante global */}
        {activeDropdown && categorias.find(cat => cat.id === activeDropdown)?.subcategorias?.length > 0 && (
          <div
            className="cat-bar-submenu animate-in"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width,
              zIndex: 30000
            }}
            onMouseEnter={handleMouseEnterAny}
            onMouseLeave={handleMouseLeave}
          >
            <div className="cat-bar-submenu-arrow" style={{ left: 32 }}></div>
            {categorias.find(cat => cat.id === activeDropdown).subcategorias.map((sub) => (
              <button
                key={sub.id}
                className="cat-bar-sub-btn"
                onClick={() => handleSubcategoryClick(sub, categorias.find(cat => cat.id === activeDropdown))}
              >
                <span className="cat-bar-dot"></span>
                {sub.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatBar;


