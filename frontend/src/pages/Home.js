import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import CatBar from '../components/cat';
import Footer from '../components/Footer';

function Home() {
  const [products, setProducts] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/productos/')
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        toast.error("No se pudieron cargar los productos");
      });
  }, []);

  const handleCantidadChange = (id, value) => {
    setCantidades({
      ...cantidades,
      [id]: Math.max(1, parseInt(value) || 1),
    });
  };

  const agregarAlCarrito = (productoId) => {
    const cantidad = cantidades[productoId] || 1;

    if (!token) {
      toast.error("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    axios.post(
      'http://localhost:8000/api/carrito/',
      {
        producto_id: productoId, // <-- Este debe coincidir con el nombre esperado por tu backend
        cantidad: cantidad,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then(() => {
        toast.success("Producto agregado al carrito");
      })
      .catch((err) => {
        if (err.response?.data?.producto_id) {
          toast.error("Error: Debes seleccionar un producto válido");
        } else if (err.response?.status === 400) {
          toast.error("El producto ya está en el carrito");
        } else {
          console.error(err);
          toast.error("No se pudo agregar al carrito");
        }
      });
  };

  return (
   
    <div className="container">
      <CatBar />
      <h2>Productos disponibles</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={`http://127.0.0.1:8000${product.imagen}`} alt={product.nombre} />
            <div className="details">
              <div className="title">{product.nombre}</div>
              <div className="price">${product.precio}</div>
              <input
                type="number"
                min="1"
                value={cantidades[product.id] || 1}
                onChange={(e) => handleCantidadChange(product.id, e.target.value)}
                className="cantidad-input"
              />
              <button
                className="btn-add"
                onClick={() => agregarAlCarrito(product.id)}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
    
  );
}

export default Home;
