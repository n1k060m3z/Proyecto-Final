import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CatBar from '../components/cat';

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
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
    return acc + parseFloat(item.producto.precio) * item.cantidad;
  }, 0);

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
        setItems([]); // vaciar carrito en frontend
        navigate('/resumen-pedido'); // redirigir a página de resumen
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error en la petición de compra:', error);
      toast.error('Error al procesar el pedido');
    }
  };

  if (loading) return <p className="p-4">Cargando carrito...</p>;

  return (
    <div className="container">
      <CatBar />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
        {items.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            <div className="grid gap-4">
              {items.map((item) =>
                item.producto ? (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-semibold">{item.producto.nombre}</p>
                      <p>${item.producto.precio}</p>
                      <p className="text-sm">Cantidad: {item.cantidad}</p>
                    </div>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : (
                  <p key={item.id} className="text-red-500">Error: producto no disponible</p>
                )
              )}
            </div>

            <div className="cart-total mt-4 text-right font-bold text-lg">
              Total: ${total.toFixed(2)}
            </div>

            <div className="mt-4 text-right">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={finalizarCompra}
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
