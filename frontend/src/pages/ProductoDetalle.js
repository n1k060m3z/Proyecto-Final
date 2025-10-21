import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../api/axios';
import AddToCartButton from '../components/AddToCartButton';
import { toast } from 'react-hot-toast';
import { getSolicitudesServicio } from '../api/ventas';
import Modal from '../components/Modal';

const MIN_LENGTH = 3;

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enCarrito, setEnCarrito] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('08:00');
  const [perfilDireccion, setPerfilDireccion] = useState(null);
  const [usarDireccionPerfil, setUsarDireccionPerfil] = useState(true);
  const [direccionServicio, setDireccionServicio] = useState({ ciudad: '', direccion: '', barrio: '' });

  // Obtener perfil del usuario para sugerir dirección
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('perfil/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setPerfilDireccion({
          direccion: res.data.direccion || '',
          ciudad: res.data.ciudad || res.data.city || '',
          barrio: res.data.barrio || ''
        });
        // Si no hay dirección en perfil, forzar ingreso de otra dirección
        if (!res.data.direccion || !res.data.ciudad) setUsarDireccionPerfil(false);
      })
      .catch(() => {
        setPerfilDireccion(null);
        setUsarDireccionPerfil(false);
      });
  }, []);

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
    if (!producto) return;
    if (cantidad < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    if (cantidad > producto.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    try {
      const res = await api.post('carrito/', { producto_id: producto.id, cantidad });
      toast.success('Producto agregado al carrito');
      setEnCarrito(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Debes iniciar sesión');
      } else {
        toast.error('No se pudo agregar al carrito');
      }
    }
  };

  const solicitarServicio = async (info = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión');
      return;
    }
    try {
      // Construir payload incluyendo dirección: preferir info.direccion si viene, sino usar perfil
      const payload = {
        servicio: producto.id,
        vendedor: producto.vendedor.id,
        fecha: info ? info.fecha : undefined,
        hora: info ? info.hora : undefined,
        detalles: info ? info.mensaje : mensaje,
        direccion: info ? info.direccion : (perfilDireccion ? perfilDireccion.direccion : undefined),
        barrio: info ? info.barrio : (perfilDireccion ? perfilDireccion.barrio : undefined),
        ciudad: info ? info.ciudad : (perfilDireccion ? perfilDireccion.ciudad : undefined),
      };
      await api.post('solicitudes-servicio/', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Solicitud de servicio enviada');
      setMensaje('');
      setModalOpen(false);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error('Error: ' + JSON.stringify(error.response.data));
      } else {
        toast.error('No se pudo enviar la solicitud');
      }
    }
  };

  useEffect(() => {
    // Forzar re-fetch del producto y evitar usar datos cacheados por componentes padres
    const fetchProducto = async () => {
      try {
        const res = await api.get(`productos/${id}/`);
        let p = res.data;
        if (p.imagen && p.imagen.startsWith('/media/productos/')) {
          p.imagen = `http://localhost:8000${p.imagen}`;
        }
        setProducto(p);
      } catch (err) {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
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
        {/* Se removieron las estrellas de calificación en la vista de detalle */}
        <div style={{marginBottom: 16}}>
          {/* Estrellas removidas; mostrar solo texto si hay reseñas */}
          <div style={{fontSize:13,color:'#666',marginTop:6}}>{producto.rating_count ? `${producto.rating_count} reseñas` : 'Sin calificaciones'}</div>
        </div>
        
        {/* SECCIÓN DE PRECIO CON DESCUENTO */}
        <div style={{ marginBottom: 16 }}>
          {/* Verificar si hay descuento usando en_oferta y descuento > 0 */}
          {producto.en_oferta && producto.descuento > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {/* Precio original tachado */}
              <span style={{ 
                fontSize: 18, 
                color: '#888', 
                textDecoration: 'line-through',
                fontWeight: 500
              }}>
                $ {Math.floor(producto.precio).toLocaleString()}
              </span>
              {/* Badge de descuento */}
              <span style={{
                background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 2px 4px rgba(229, 57, 53, 0.3)'
              }}>
                -{producto.descuento}%
              </span>
            </div>
          )}
          {/* Precio actual */}
          <div style={{ 
            fontSize: 24, 
            color: (producto.en_oferta && producto.descuento > 0) ? '#2e7d32' : '#444', 
            fontWeight: 700 
          }}>
            {producto.en_oferta && producto.descuento > 0 ? (
              `$ ${Math.floor(producto.precio_con_descuento || (producto.precio * (1 - producto.descuento / 100))).toLocaleString()}`
            ) : (
              producto.precio ? `$ ${Math.floor(producto.precio).toLocaleString()}` : 'Precio a convenir'
            )}
          </div>
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
          <b>Ciudad:</b> {(() => {
            console.log('DEBUG ciudad_vendedor:', producto.ciudad_vendedor, 'ciudad:', producto.ciudad, 'producto:', producto);
            return producto.ciudad_vendedor || producto.ciudad || '-';
          })()}
        </div>
        <div style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
          <b>Vendedor:</b>{' '}
          {producto.vendedor && producto.vendedor.username ? (
            <a
              href={`/vendedor/${producto.vendedor.id}`}
              style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
            >
              {producto.vendedor.username}
            </a>
          ) : (
            '-'
          )}
        </div>
        <div style={{ marginTop: 24, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {/* Mostrar botón de solicitar servicio solo si es de tipo servicio */}
          {(
            (producto.categoria && (
              (typeof producto.categoria === 'object' && producto.categoria.nombre && producto.categoria.nombre.toLowerCase().includes('servicio')) ||
              (typeof producto.categoria === 'string' && producto.categoria.toLowerCase().includes('servicio')) ||
              (typeof producto.categoria === 'number' && producto.categoria === 3)
            ))
          ) && (
            <div style={{width:'100%',marginBottom:12}}>
              <button onClick={() => setModalOpen(true)} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:4,padding:'10px 18px',cursor:'pointer'}}>Solicitar servicio</button>
            </div>
          )}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <h2>Solicitar servicio</h2>
            <form onSubmit={e => {
              e.preventDefault();
              // Validaciones: fecha no puede ser pasada
              if (!fecha) { toast.error('Selecciona una fecha'); return; }
              const hoy = new Date().toISOString().split('T')[0];
              if (fecha < hoy) { toast.error('La fecha no puede ser pasada'); return; }
              // Dirección: si no usamos la del perfil, validar campos
              let direccionPayload = null;
              if (usarDireccionPerfil) {
                if (!perfilDireccion || !perfilDireccion.direccion || !perfilDireccion.ciudad || !perfilDireccion.barrio) {
                  toast.error('Tu perfil no tiene dirección completa. Ingresa una dirección');
                  return;
                }
                direccionPayload = { direccion: perfilDireccion.direccion, ciudad: perfilDireccion.ciudad, barrio: perfilDireccion.barrio };
              } else {
                if (!direccionServicio.direccion || direccionServicio.direccion.trim().length < MIN_LENGTH) { toast.error('Dirección inválida'); return; }
                if (!direccionServicio.ciudad || direccionServicio.ciudad.trim().length < MIN_LENGTH) { toast.error('Ciudad inválida'); return; }
                if (!direccionServicio.barrio || direccionServicio.barrio.trim().length < MIN_LENGTH) { toast.error('Barrio inválido'); return; }
                direccionPayload = { ...direccionServicio };
              }
              solicitarServicio({ fecha, hora, mensaje, ...direccionPayload });
            }} style={{display:'flex',flexDirection:'column',gap:12}}>
              <label>Fecha:
                <input type="date" min={new Date().toISOString().split('T')[0]} value={fecha} onChange={e => setFecha(e.target.value)} style={{marginLeft:4}} required />
              </label>
              <label>Hora:
                <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={{marginLeft:4}} required />
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={usarDireccionPerfil} onChange={() => setUsarDireccionPerfil(true)} /> Usar mi dirección guardada
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" checked={!usarDireccionPerfil} onChange={() => setUsarDireccionPerfil(false)} /> Ingresar otra dirección
                </label>
              </div>
              {!usarDireccionPerfil && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input placeholder="Ciudad" value={direccionServicio.ciudad} onChange={e => setDireccionServicio(s => ({ ...s, ciudad: e.target.value }))} className="input" />
                  <input placeholder="Dirección" value={direccionServicio.direccion} onChange={e => setDireccionServicio(s => ({ ...s, direccion: e.target.value }))} className="input" />
                  <input placeholder="Barrio" value={direccionServicio.barrio} onChange={e => setDireccionServicio(s => ({ ...s, barrio: e.target.value }))} className="input" />
                </div>
              )}
              <label>Detalles:
                <textarea
                  placeholder="Mensaje para el vendedor (opcional)"
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  style={{width:'100%',minHeight:60,padding:8,borderRadius:4,border:'1px solid #ccc'}}
                />
              </label>
              <button type="submit" style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:4,padding:'10px 18px',cursor:'pointer'}}>Enviar solicitud</button>
            </form>
          </Modal>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <label htmlFor="cantidad-input-detalle" style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>Cantidad</label>
            <input
              id="cantidad-input-detalle"
              type="number"
              min={1}
              max={producto.stock}
              value={cantidad}
              onChange={e => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val === '' || parseInt(val) < 1) val = 1;
                if (parseInt(val) > producto.stock) val = producto.stock;
                setCantidad(parseInt(val));
              }}
              style={{ width: 60, textAlign: 'center' }}
              disabled={enCarrito || producto.stock === 0}
              hidden={producto.stock === 0}
            />
          </div>
          {/* Ocultar botón de carrito si es un servicio */}
          {!(producto && producto.categoria && (producto.categoria.nombre === 'Servicios' || producto.categoria === 'Servicios')) && (
            <AddToCartButton
              onClick={handleAddToCart}
              added={enCarrito}
              disabled={enCarrito || (producto && producto.stock === 0)}
            />
          )}
          {producto && producto.stock === 0 && <span style={{ color: 'red', fontSize: 12 }}>Agotado</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
