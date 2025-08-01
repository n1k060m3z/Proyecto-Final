import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import "./style/cat.css";
 
const CatBar = () => {
  const [categorias, setCategorias] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
 
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/categorias/")
      .then((res) => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);
 
  const handleMouseEnter = (catId) => {
    setHovered(catId);
    setActiveDropdown(catId);
  };
 
  const handleMouseLeave = () => {
    setHovered(null);
    setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
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
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-3 overflow-x-auto scrollbar-hide">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="relative flex-shrink-0"
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    hovered === cat.id
                      ? "bg-white text-blue-600 shadow-md transform scale-105"
                      : "text-white hover:bg-blue-500 hover:bg-opacity-30"
                  }
                `}
                data-category-id={cat.id}
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onClick={() => handleMainCategoryClick(cat)}
              >
                {cat.nombre}
                {cat.subcategorias && cat.subcategorias.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      activeDropdown === cat.id ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
 
              {activeDropdown === cat.id &&
                cat.subcategorias &&
                cat.subcategorias.length > 0 && (
                  <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200 min-w-48"
                    style={{
                      top: `${
                        document.querySelector(`[data-category-id="${cat.id}"]`)
                          ?.getBoundingClientRect().bottom + 8
                      }px`,
                      left: `${
                        document.querySelector(`[data-category-id="${cat.id}"]`)
                          ?.getBoundingClientRect().left
                      }px`,
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                    {cat.subcategorias.map((sub, index) => (
                      <button
                        key={sub.id}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center gap-2"
                        onClick={() => handleSubcategoryClick(sub, cat)}
                      >
                        <span className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></span>
                        {sub.nombre}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-8px);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
 
export default CatBar;
// Eliminado el componente duplicado CategoriasBar.js para evitar duplicidad y problemas de consistencia.
 
 