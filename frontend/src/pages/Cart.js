import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CatBar from '../components/cat';
import '../components/style/CartPage.css';

// Componente 1: Filtros generales
function CartFilters({ items, setShowAll, showAll, allSelected, handleSelectAll }) {
  return (
    <div className="cart-filters">
      <label>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
        />{' '}
        Todos los productos ({items.length})
      </label>
    </div>
  );
}

// Componente 2: Listado de productos
function CartProductGroup({ items, eliminarDelCarrito, selectedIds, handleSelect, handleCantidadChange }) {
  if (!items.length) return null;
  return (
    <div className="cart-product-group">
      <div className="cart-group-title">Productos en tu carrito</div>
      {items.map((item) =>
        item.producto ? (
          <div className="cart-product" key={item.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => handleSelect(item.id)}
              style={{ marginRight: 8 }}
            />
            <img
              src={item.producto.imagen || 'https://via.placeholder.com/60'}
              alt={item.producto.nombre}
              className="cart-product-img"
            />
            <div className="cart-product-info">
              <div className="cart-product-name">{item.producto.nombre}</div>
              <div className="cart-product-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Cantidad:</span>
                <input
                  type="number"
                  min={1}
                  max={item.producto.stock}
                  value={item.cantidad}
                  onChange={e => handleCantidadChange(item, e.target.value)}
                  style={{ width: 50, textAlign: 'center' }}
                  disabled={item.producto.stock === 0}
                />
                <button
                  className="cart-remove"
                  onClick={() => eliminarDelCarrito(item.id)}
                >
                  Eliminar
                </button>
              </div>
              {item.producto.stock === 0 && <span style={{ color: 'red', fontSize: 12 }}>Sin stock</span>}
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [seleccionInicial, setSeleccionInicial] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Solo seleccionar todos los productos la primera vez que se cargan
  useEffect(() => {
    if (!seleccionInicial && items.length > 0) {
      setSelectedIds(items.map((item) => item.id));
      setSeleccionInicial(true);
    }
  }, [items, seleccionInicial]);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

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

  // Cambiar cantidad de un producto en el carrito
  const handleCantidadChange = async (item, value) => {
    let cantidad = parseInt(value);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
    if (cantidad > item.producto.stock) cantidad = item.producto.stock;
    if (cantidad === item.cantidad) return;
    try {
      const res = await fetch(`http://localhost:8000/api/carrito/${item.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad })
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, cantidad } : i));
      } else {
        toast.error('No se pudo actualizar la cantidad');
      }
    } catch {
      toast.error('Error al actualizar la cantidad');
    }
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const total = selectedItems.reduce((acc, item) => {
    return acc + (item.producto ? parseFloat(item.producto.precio) * item.cantidad : 0);
  }, 0);
  const shipping = selectedItems.length > 0 ? 12300 : 0;

  // Navegar al flujo de checkout anidado
  const finalizarCompra = () => {
    navigate('/checkout/envio');
  };

  if (loading) return <p className="p-4">Cargando carrito...</p>;

  return (
    <div>
      <CatBar />
      <div className="cart-page-container">
        <div className="cart-main">
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 16 }}>Carrito de Compras</h2>
          <CartFilters
            items={items}
            setShowAll={setShowAll}
            showAll={showAll}
            allSelected={selectedIds.length === items.length && items.length > 0}
            handleSelectAll={handleSelectAll}
          />
          {items.length === 0 ? (
            <p>Tu carrito está vacío.</p>
          ) : (
            <CartProductGroup
              items={items}
              eliminarDelCarrito={eliminarDelCarrito}
              selectedIds={selectedIds}
              handleSelect={handleSelect}
              handleCantidadChange={handleCantidadChange}
            />
          )}
        </div>
        <div className="cart-side">
          <CartSummary
            total={total}
            shipping={shipping}
            finalizarCompra={finalizarCompra}
            disabled={selectedIds.length === 0}
          />
        </div>
      </div>
    </div>
  );
}

export default Cart;
