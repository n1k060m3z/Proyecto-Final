import React from "react";
import "./style/cat.css";

// enpoint 
const categorias = [
  "Tecnología",
  "Ropa",
  "Servicios",
  "Hogar",
  "Deportes",
  "Libros",
  "Juguetes"
];

const CatBar = () => (
  <div className="cat-bar">
    {categorias.map((cat) => (
      <button
        key={cat}
        className="cat-bar-btn"
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CatBar;
