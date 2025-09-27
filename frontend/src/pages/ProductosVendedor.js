import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from '../api/axios';
import '../style/busqueda.css';
import AddToCartButton from '../components/AddToCartButton';
import CatBar from '../components/cat';

const ProductosVendedor = () => {
  const { vendedorId } = useParams();
  const [productos, setProductos] = useState([]);
  const [vendedor, setVendedor] = useState(null);

  useEffect(() => {
    api.get(`http://localhost:8000/api/productos/vendedor/${vendedorId}/`)
      .then(res => {
        setProductos(res.data);
        if (res.data.length > 0 && res.data[0].vendedor) {
          setVendedor(res.data[0].vendedor);
        }
      })
      .catch(() => setProductos([]));
  }, [vendedorId]);

  return (
    <div className="container">
      <CatBar />
      <div className="busqueda-container">
        <main className="busqueda-main">
          <h2 style={{marginBottom: 24}}>
            Productos de {vendedor ? vendedor.username : 'Vendedor'}
          </h2>
          {productos.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888', fontSize: 20, marginTop: 40}}>
              Este vendedor no tiene productos activos
            </div>
          ) : (
            productos.map(producto => (
              <div key={producto.id} className="producto-link-wrapper" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  to={`/producto/${producto.id}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="producto-card" style={{ width: '100%' }}>
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="producto-img"
                    />
                    <div className="producto-info">
                      <div className="producto-nombre">{producto.nombre}</div>
                      <div className="producto-precio">
                        {producto.en_oferta && producto.descuento > 0 ? (
                          <>
                            <span style={{ color: '#e53935', fontWeight: 700 }}>
                              $ {Math.floor(producto.precio_con_descuento).toLocaleString()}
                            </span>
                            <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 8 }}>
                              $ {Math.floor(producto.precio).toLocaleString()}
                            </span>
                            <span style={{ color: '#388e3c', marginLeft: 8 }}>
                              -{producto.descuento}%
                            </span>
                          </>
                        ) : (
                          producto.precio
                            ? `$ ${Math.floor(producto.precio).toLocaleString()}`
                            : "Precio a convenir"
                        )}
                      </div>
                      <div className="producto-ciudad">
                        {producto.ciudad || ""}
                      </div>
                    </div>
                  </div>
                </Link>
                <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <AddToCartButton
                    onClick={() => {}}
                    added={false}
                    disabled={producto.stock === 0}
                  />
                  {producto.stock === 0 && <span style={{ color: 'red', fontSize: 12 }}>Agotado</span>}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductosVendedor;
