import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Volver from '../../components/Volver';
import { crearPedido } from '../../api/ventas';
import api from '../../api/axios';

const metodos = [
  { id: 'tarjeta', label: 'Tarjeta Débito/Crédito' },
  { id: 'pse', label: 'Transferencia con PSE' },
  { id: 'efecty', label: 'Efecty' },
  { id: 'contraentrega', label: 'ContraEntrega' },
];

const datosUsuarioDefault = {
  nombre: '',
  direccion: '',
  telefono: '',
  correo: '',
  ciudad: '',
  barrio: '',
};

const CheckoutPago = () => {
  const [seleccion, setSeleccion] = useState(metodos[0].id);
  const [form, setForm] = useState(datosUsuarioDefault);
  const [formValido, setFormValido] = useState(false);
  const [carritoItems, setCarritoItems] = useState([]);
  const navigate = useNavigate();

  // Al montar, asegurar que usuario_data esté en localStorage y tenga username y email
  useEffect(() => {
    const usuarioLS = localStorage.getItem('usuario_data');
    let needsFetch = true;
    if (usuarioLS) {
      const usuario = JSON.parse(usuarioLS);
      if (usuario.nombre && usuario.correo) needsFetch = false;
    }
    if (needsFetch) {
      api.get('perfil/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          localStorage.setItem('usuario_data', JSON.stringify({
            id: res.data.id,
            nombre: res.data.username || res.data.nombre || '',
            correo: res.data.email || '',
            telefono: res.data.telefono || '',
            direccion: res.data.direccion || '',
            ciudad: res.data.ciudad || '',
            barrio: res.data.barrio || '',
          }));
        });
    }
  }, []);

  // Prellenar datos del usuario y dirección cada vez que se selecciona contraentrega
  useEffect(() => {
    if (seleccion === 'contraentrega') {
      // Esperar a que usuario_data esté disponible
      const rellenar = () => {
        const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        let direccionEntregaRaw = null;
        try {
          direccionEntregaRaw = JSON.parse(localStorage.getItem('direccion_entrega') || 'null');
        } catch (e) {
          direccionEntregaRaw = null;
        }
        // Normalizar: direccionEntrega puede ser un string (formato previo) o un objeto { direccion, ciudad, barrio }
        let direccionEntregaObj = null;
        if (direccionEntregaRaw && typeof direccionEntregaRaw === 'object') {
          direccionEntregaObj = direccionEntregaRaw;
        } else if (direccionEntregaRaw && typeof direccionEntregaRaw === 'string') {
          // intentar extraer ciudad si el string contiene comas: 'direccion, Barrio X, Ciudad'
          const parts = direccionEntregaRaw.split(',').map(p => p.trim()).filter(Boolean);
          const last = parts.length ? parts[parts.length - 1] : '';
          direccionEntregaObj = { direccion: parts.slice(0, parts.length - 1).join(', ') || direccionEntregaRaw, barrio: parts.length >= 2 ? parts[parts.length - 2].replace(/^Barrio\\s+/i, '') : '', ciudad: last || '' };
        }
        setForm(f => ({
          ...f,
          nombre: usuario.nombre || usuario.username || '',
          direccion: (direccionEntregaObj && direccionEntregaObj.direccion) || usuario.direccion || '',
          telefono: usuario.telefono || '',
          correo: usuario.correo || usuario.email || '',
          ciudad: (direccionEntregaObj && direccionEntregaObj.ciudad) || usuario.ciudad || '',
          barrio: (direccionEntregaObj && direccionEntregaObj.barrio) || usuario.barrio || '',
        }));
      };
      rellenar();
      // Si el correo sigue vacío, reintenta tras 300ms (por si el fetch es asíncrono)
      setTimeout(() => {
        const usuario = JSON.parse(localStorage.getItem('usuario_data') || '{}');
        if (!usuario.correo && usuario.email) {
          usuario.correo = usuario.email;
          localStorage.setItem('usuario_data', JSON.stringify(usuario));
        }
        if (!form.correo && (usuario.correo || usuario.email)) {
          setForm(f => ({ ...f, correo: usuario.correo || usuario.email || '' }));
        }
      }, 300);
    }
  }, [seleccion]);

  useEffect(() => {
    if (seleccion === 'contraentrega') {
      setFormValido(
        form.nombre && form.direccion && form.telefono && form.correo && form.ciudad && form.barrio
      );
    } else {
      setFormValido(true);
    }
  }, [form, seleccion]);

  // Obtener los items reales del carrito del backend
  useEffect(() => {
    api.get('carrito/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        // El backend devuelve una lista de CarritoItem (res.data) o a veces un objeto { items: [...] }.
        const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setCarritoItems(items);
      })
      .catch(() => setCarritoItems([]));
  }, []);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirmar = async () => {
    // Refrescar usuario_data desde backend por si cambió la sesión
    try {
      const perfilRes = await api.get('perfil/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (perfilRes && perfilRes.data) {
        localStorage.setItem('usuario_data', JSON.stringify({
          id: perfilRes.data.id,
          nombre: perfilRes.data.username || perfilRes.data.nombre || '',
          correo: perfilRes.data.email || perfilRes.data.correo || '',
          telefono: perfilRes.data.telefono || '',
          direccion: perfilRes.data.direccion || '',
          ciudad: perfilRes.data.city || perfilRes.data.ciudad || '',
          barrio: perfilRes.data.barrio || ''
        }));
      }
    } catch (e) {
      console.log('DEBUG error refrescando perfil antes de crear pedido', e);
    }

    // Usar los IDs reales de los CarritoItem del backend
    const ids = carritoItems.map(item => item.id);
    // Preparar datos de entrega desde el form (si contraentrega) o desde direccion_entrega
    let entregaObj = {};
    if (seleccion === 'contraentrega') {
      entregaObj = {
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
        correo: form.correo,
        ciudad: form.ciudad,
        barrio: form.barrio
      };
    } else {
      // Otros métodos: intentar usar direccion_entrega guardada
      try {
        entregaObj = JSON.parse(localStorage.getItem('direccion_entrega') || 'null') || {};
      } catch (e) {
        entregaObj = {};
      }
    }

    try {
      await crearPedido(ids, entregaObj, seleccion);
    } catch (err) {
      console.error('Error al crear pedido:', err);
      alert('Error al crear el pedido en el backend');
      return;
    }
    // Guardar resumen ANTES de limpiar el carrito
    const resumen = { items: carritoItems, total: carritoItems.reduce((acc, item) => acc + (item.producto?.precio || 0) * item.cantidad, 0), entrega: entregaObj, metodo: seleccion };
    localStorage.setItem('ultimo_resumen_pedido', JSON.stringify(resumen));
    // Limpiar carrito local solo para frontend
    localStorage.removeItem('carrito');
    // Forzar refresco del carrito desde backend
    try {
      const res = await api.get('carrito/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      setCarritoItems(items);
    } catch (e) {
      setCarritoItems([]);
    }
    navigate('/resumen-pedido', { state: resumen });
  };

  return (
    <div>
      <Volver />
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Elige cómo pagar</h2>
      <div style={{ marginBottom: 24 }}>
        {metodos.map(metodo => (
          <div key={metodo.id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 18, display: 'flex', alignItems: 'center', background: '#fafbfc' }}>
            <input
              type="radio"
              name="pago"
              checked={seleccion === metodo.id}
              onChange={() => setSeleccion(metodo.id)}
              style={{ marginRight: 16 }}
            />
            <div style={{ fontWeight: 600 }}>{metodo.label}</div>
          </div>
        ))}
      </div>
      {seleccion === 'contraentrega' && (
        <div style={{ background: '#fffde7', border: '1px solid #ffe082', borderRadius: 8, padding: 18, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Datos para ContraEntrega</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input name="nombre" value={form.nombre} onChange={handleFormChange} placeholder="Nombre y apellido" className="input" />
            <input name="direccion" value={form.direccion} onChange={handleFormChange} placeholder="Dirección" className="input" />
            <input name="barrio" value={form.barrio} onChange={handleFormChange} placeholder="Barrio" className="input" />
            <input name="telefono" value={form.telefono} onChange={handleFormChange} placeholder="Teléfono" className="input" />
            <input name="correo" value={form.correo} onChange={handleFormChange} placeholder="Correo" className="input" />
            <input name="ciudad" value={form.ciudad} onChange={handleFormChange} placeholder="Ciudad" className="input" />
          </div>
        </div>
      )}
      <button
        onClick={handleConfirmar}
        style={{ background: '#2979ff', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: formValido ? 'pointer' : 'not-allowed', opacity: formValido ? 1 : 0.6 }}
        disabled={!formValido}
      >
        Confirmar compra
      </button>
    </div>
  );
};

export default CheckoutPago;
