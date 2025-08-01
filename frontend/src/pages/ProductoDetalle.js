import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api/axios';
import AddToCartButton from '../components/AddToCartButton';
import { toast } from 'react-hot-toast';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enCarrito, setEnCarrito] = useState(false);
  // Verificar si el producto ya está en el carrito
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !producto) return;
    fetch('http://localhost:8000/api/carrito/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setEnCarrito(data.some(item => item.producto && (item.producto.id === producto.id || item.producto === producto.id)));
        }
      })
      .catch(() => setEnCarrito(false));
  }, [producto]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/carrito/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ producto_id: producto.id, cantidad: 1 })
      });
      if (res.ok) {
        toast.success('Producto agregado al carrito');
        setEnCarrito(true);
      } else {
        toast.error('No se pudo agregar al carrito');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    }
  };

  useEffect(() => {
    api.get(`http://localhost:8000/api/productos/${id}/`)
      .then(res => {
        let p = res.data;
        if (p.imagen && p.imagen.startsWith('/media/productos/')) {
          p.imagen = `http://localhost:8000${p.imagen}`;
        }
        setProducto(p);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el producto');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{padding: 32}}>Cargando...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>{error}</div>;
  if (!producto) return null;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 32, display: 'flex', gap: 32 }}>
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={producto.imagen} alt={producto.nombre} style={{ width: 300, height: 300, objectFit: 'contain', borderRadius: 8, background: '#f5f5f5' }} />
      </div>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{producto.nombre}</h1>
        <div style={{ fontSize: 20, color: '#444', fontWeight: 600, marginBottom: 16 }}>
          {producto.precio ? `$ ${Math.floor(producto.precio).toLocaleString()}` : 'Precio a convenir'}
        </div>
        <div style={{ fontSize: 16, color: '#222', marginBottom: 24 }}>
          <b>Descripción:</b><br />
          {producto.descripcion || 'Sin descripción'}
        </div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
          <b>Categoría:</b> {producto.categoria?.nombre || producto.categoria || '-'}
        </div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
          <b>Subcategoría:</b> {producto.subcategoria?.nombre || producto.subcategoria || '-'}
        </div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
          <b>Ciudad:</b> {producto.ciudad || '-'}
        </div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
          <b>Vendedor:</b> {producto.vendedor || '-'}
        </div>
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <AddToCartButton
            onClick={handleAddToCart}
            added={enCarrito}
            disabled={enCarrito}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
