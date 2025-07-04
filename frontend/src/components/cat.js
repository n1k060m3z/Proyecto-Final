import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style/cat.css";

const CatBar = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/categorias/")
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  return (
    <div className="cat-bar">
      {categorias.map((cat) => (
        <button
          key={cat.id}
          className="cat-bar-btn"
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
};

export default CatBar;
