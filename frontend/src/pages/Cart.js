import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CatBar from '../components/cat';
import '../components/style/CartPage.css';

// Componente 1: Filtros generales
function CartFilters({ items, setShowAll, showAll }) {
  return (
    <div className="cart-filters">
      <label>
        <input
          type="checkbox"
          checked={showAll}
          onChange={() => setShowAll((v) => !v)}
        />{' '}
        Todos los productos ({items.length})
      </label>
    </div>
  );
}

// Componente 2: Listado de productos
function CartProductGroup({ items, eliminarDelCarrito }) {
  if (!items.length) return null;
  return (
    <div className="cart-product-group">
      <div className="cart-group-title">Productos en tu carrito</div>
      {items.map((item) =>
        item.producto ? (
          <div className="cart-product" key={item.id}>
            <img
              src={item.producto.imagen || 'https://via.placeholder.com/60'}
              alt={item.producto.nombre}
              className="cart-product-img"
            />
            <div className="cart-product-info">
              <div className="cart-product-name">{item.producto.nombre}</div>
              <div className="cart-product-actions">
                <span>Cantidad: {item.cantidad}</span>
                <button
                  className="cart-remove"
                  onClick={() => eliminarDelCarrito(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="cart-product-price">
              ${parseFloat(item.producto.precio).toLocaleString()}
            </div>
          </div>
        ) : (
          <p key={item.id} className="text-red-500">Error: producto no disponible</p>
        )
      )}
      <div className="cart-shipping">
        <span>Envío</span>
        <span className="cart-shipping-price">$12.300</span>
      </div>
    </div>
  );
}

// Componente 3: Resumen de compra
function CartSummary({ total, shipping, finalizarCompra, disabled }) {
  return (
    <div className="cart-summary">
      <h3>Resumen de compra</h3>
      <div className="cart-summary-row">
        <span>Producto</span>
        <span>${total.toLocaleString()}</span>
      </div>
      <div className="cart-summary-row">
        <span>Envío</span>
        <span>${shipping.toLocaleString()}</span>
      </div>
      <div className="cart-summary-total">
        <span>Total</span>
        <span>${(total + shipping).toLocaleString()}</span>
      </div>
      <button
        className="cart-summary-btn"
        onClick={finalizarCompra}
        disabled={disabled}
      >
        Finalizar compra
      </button>
    </div>
  );
}

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      toast.error('Debes iniciar sesión');
      navigate('/iniciar-sesion');
      return;
    }
    const cargarCarrito = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/carrito/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          toast.error('Sesión expirada. Inicia sesión de nuevo');
          localStorage.clear();
          navigate('/iniciar-sesion');
          return;
        }
        if (!res.ok) {
          throw new Error('No se pudo cargar el carrito');
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('No se pudo cargar el carrito');
      } finally {
        setLoading(false);
      }
    };
    cargarCarrito();
  }, [token, navigate]);

  const eliminarDelCarrito = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/carrito/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        toast.success('Producto eliminado del carrito');
      } else {
        toast.error('No se pudo eliminar el producto');
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    }
  };

  const total = items.reduce((acc, item) => {
    return acc + (item.producto ? parseFloat(item.producto.precio) * item.cantidad : 0);
  }, 0);
  const shipping = items.length > 0 ? 12300 : 0;

  const finalizarCompra = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/pedido/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success('Pedido realizado con éxito');
        setItems([]);
        navigate('/resumen-pedido');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      toast.error('Error al procesar el pedido');
    }
  };

  if (loading) return <p className="p-4">Cargando carrito...</p>;

  return (
    <div>
      <CatBar />
      <div className="cart-page-container">
        <div className="cart-main">
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 16 }}>Carrito de Compras</h2>
          <CartFilters items={items} setShowAll={setShowAll} showAll={showAll} />
          {items.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <CartProductGroup items={items} eliminarDelCarrito={eliminarDelCarrito} />
          )}
        </div>
        <div className="cart-side">
          <CartSummary total={total} shipping={shipping} finalizarCompra={finalizarCompra} disabled={items.length === 0} />
        </div>
      </div>
    </div>
  );
}

export default Cart;
