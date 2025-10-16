import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Volver from '../../components/Volver';
import api from '../../api/axios';

const MIN_LENGTH = 3;

const CheckoutEnvio = ({ setMetodoEnvio }) => {
  // direccion será un objeto: { direccion: '', ciudad: '', barrio: '' }
  const [direccion, setDireccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usarOtra, setUsarOtra] = useState(false);
  const [otraDireccion, setOtraDireccion] = useState({ ciudad: '', direccion: '', barrio: '' });
  const [ciudades, setCiudades] = useState([]);
  const [errors, setErrors] = useState({ ciudad: '', direccion: '', barrio: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('perfil/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        // Normalizar la dirección del perfil a un objeto
        setDireccion({
          direccion: res.data.direccion || '',
          ciudad: res.data.ciudad || '',
          barrio: res.data.barrio || ''
        });
        setLoading(false);
      })
      .catch(() => {
        setDireccion(null);
        setLoading(false);
      });

    // Cargar lista de ciudades para autocomplete (si existe el endpoint)
    api.get('ciudades/')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data.map(c => (typeof c === 'object' ? (c.nombre || c.name || c.label) : String(c))) : [];
        setCiudades(list);
      })
      .catch(() => setCiudades([]));
  }, []);

  const handleContinuar = () => {
    // Validaciones mínimas: los campos deben existir y tener longitud mínima
    if (!usarOtra) {
      if (!direccion || !direccion.ciudad || !direccion.direccion || !direccion.barrio) return;
      if (direccion.ciudad.trim().length < MIN_LENGTH || direccion.direccion.trim().length < MIN_LENGTH || direccion.barrio.trim().length < MIN_LENGTH) return;
      // Si tenemos lista de ciudades, validar que la ciudad exista
      if (ciudades.length > 0 && !ciudades.includes(direccion.ciudad.trim())) return;
    }
    if (usarOtra) {
      if (!otraDireccion.ciudad || !otraDireccion.direccion || !otraDireccion.barrio) return;
      if (otraDireccion.ciudad.trim().length < MIN_LENGTH || otraDireccion.direccion.trim().length < MIN_LENGTH || otraDireccion.barrio.trim().length < MIN_LENGTH) return;
      if (ciudades.length > 0 && !ciudades.includes(otraDireccion.ciudad.trim())) return;
    }
    if (setMetodoEnvio) setMetodoEnvio('domicilio');
    // Guardar dirección seleccionada en localStorage para el siguiente paso
    // Guardamos un objeto estructurado para poder reutilizar campos (ciudad, barrio, direccion)
    const direccionFinal = !usarOtra ? direccion : { ...otraDireccion };
    localStorage.setItem('direccion_entrega', JSON.stringify(direccionFinal));
    navigate('/checkout/pago');
  };

  if (loading) return <div>Cargando dirección...</div>;

  return (
    <div>
      <Volver />
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Revisa la forma de entrega</h2>
      <div style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 16, padding: 20, background: '#fafbfc' }}>
        <input
          type="radio"
          name="envio"
          checked={!usarOtra}
          onChange={() => setUsarOtra(false)}
          style={{ marginRight: 16 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Enviar a mi dirección guardada</div>
          {direccion ? (
            // Mostrar los campos de la dirección guardada
            <div style={{ color: '#555', fontSize: 15 }}>
              {direccion.direccion}{direccion.barrio ? `, Barrio ${direccion.barrio}` : ''}{direccion.ciudad ? `, ${direccion.ciudad}` : ''}
            </div>
          ) : (
            <div style={{ color: '#e53935', fontSize: 15 }}>
              No tienes una dirección de entrega asignada.<br />
              <button
                onClick={() => navigate('/perfil')}
                style={{ marginTop: 8, background: '#2979ff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
              >
                Agregar dirección de entrega
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 16, padding: 20, background: '#fafbfc' }}>
        <input
          type="radio"
          name="envio"
          checked={usarOtra}
          onChange={() => setUsarOtra(true)}
          style={{ marginRight: 16 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Enviar a otra dirección</div>
          {usarOtra && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Ciudad"
                list="ciudades-list"
                value={otraDireccion.ciudad}
                onChange={e => { setOtraDireccion({ ...otraDireccion, ciudad: e.target.value }); setErrors({ ...errors, ciudad: '' }); }}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
              {ciudades.length > 0 && (
                <datalist id="ciudades-list">
                  {ciudades.map((c, idx) => <option key={idx} value={c} />)}
                </datalist>
              )}
              {errors.ciudad && <div style={{ color: 'red', fontSize: 13 }}>{errors.ciudad}</div>}
              <input
                type="text"
                placeholder="Dirección"
                value={otraDireccion.direccion}
                onChange={e => { setOtraDireccion({ ...otraDireccion, direccion: e.target.value }); setErrors({ ...errors, direccion: '' }); }}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
              {errors.direccion && <div style={{ color: 'red', fontSize: 13 }}>{errors.direccion}</div>}
              <input
                type="text"
                placeholder="Barrio"
                value={otraDireccion.barrio}
                onChange={e => { setOtraDireccion({ ...otraDireccion, barrio: e.target.value }); setErrors({ ...errors, barrio: '' }); }}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
              {errors.barrio && <div style={{ color: 'red', fontSize: 13 }}>{errors.barrio}</div>}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          // Ejecutar validaciones visuales antes de continuar
          const newErrors = { ciudad: '', direccion: '', barrio: '' };
          let ok = true;
          if (!usarOtra) {
            if (!direccion || !direccion.ciudad || direccion.ciudad.trim().length < MIN_LENGTH) { newErrors.ciudad = 'Ciudad inválida'; ok = false; }
            if (!direccion || !direccion.direccion || direccion.direccion.trim().length < MIN_LENGTH) { newErrors.direccion = 'Dirección inválida'; ok = false; }
            if (!direccion || !direccion.barrio || direccion.barrio.trim().length < MIN_LENGTH) { newErrors.barrio = 'Barrio inválido'; ok = false; }
            if (ciudades.length > 0 && direccion && !ciudades.includes(direccion.ciudad.trim())) { newErrors.ciudad = 'Ciudad no encontrada en la lista'; ok = false; }
          } else {
            if (!otraDireccion.ciudad || otraDireccion.ciudad.trim().length < MIN_LENGTH) { newErrors.ciudad = 'Ciudad inválida'; ok = false; }
            if (!otraDireccion.direccion || otraDireccion.direccion.trim().length < MIN_LENGTH) { newErrors.direccion = 'Dirección inválida'; ok = false; }
            if (!otraDireccion.barrio || otraDireccion.barrio.trim().length < MIN_LENGTH) { newErrors.barrio = 'Barrio inválido'; ok = false; }
            if (ciudades.length > 0 && !ciudades.includes(otraDireccion.ciudad.trim())) { newErrors.ciudad = 'Ciudad no encontrada en la lista'; ok = false; }
          }
          setErrors(newErrors);
          if (ok) handleContinuar();
        }}
        style={{ marginTop: 24, background: ((!usarOtra && direccion && direccion.ciudad && direccion.direccion && direccion.barrio) || (usarOtra && otraDireccion.ciudad && otraDireccion.direccion && otraDireccion.barrio)) ? '#2979ff' : '#bbb', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: ((!usarOtra && direccion && direccion.ciudad && direccion.direccion && direccion.barrio) || (usarOtra && otraDireccion.ciudad && otraDireccion.direccion && otraDireccion.barrio)) ? 'pointer' : 'not-allowed' }}
        disabled={(!usarOtra && (!direccion || !direccion.ciudad || !direccion.direccion || !direccion.barrio)) || (usarOtra && (!otraDireccion.ciudad || !otraDireccion.direccion || !otraDireccion.barrio))}
      >
        Continuar
      </button>
    </div>
  );
};

export default CheckoutEnvio;
