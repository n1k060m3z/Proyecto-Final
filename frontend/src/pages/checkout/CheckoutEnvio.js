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
  // ciudades ahora será lista de objetos { id, name }
  const [ciudades, setCiudades] = useState([]);
  const [errors, setErrors] = useState({ ciudad: '', direccion: '', barrio: '' });
  const [faltanCamposPerfil, setFaltanCamposPerfil] = useState(false);
  // Nuevo estado: editar datos directamente en la tarjeta superior
  const [editarPerfil, setEditarPerfil] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar lista de ciudades primero (si existe el endpoint)
    api.get('ciudades/')
      .then(res => {
        const list = Array.isArray(res.data)
          ? res.data.map(c => (typeof c === 'object'
              ? { id: c.id || c.pk || null, name: c.nombre || c.name || c.label || '' }
              : { id: null, name: String(c) }))
          : [];
        setCiudades(list);
      })
      .catch(() => setCiudades([]))
      .finally(() => {
        // Después de intentar cargar ciudades, cargar perfil
        api.get('perfil/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
          .then(res => {
            // Puede venir como `city` (id) o `ciudad` (nombre)
            const rawCity = res.data.ciudad ?? res.data.city ?? '';
            const perfilDireccion = {
              direccion: res.data.direccion || '',
              ciudad: rawCity,
              barrio: res.data.barrio || ''
            };
            setDireccion(perfilDireccion);
            // Si faltan campos críticos (ciudad o barrio), avisar y permitir completarlos
            if (!perfilDireccion.ciudad || !perfilDireccion.barrio) {
              setFaltanCamposPerfil(true);
            } else {
              setFaltanCamposPerfil(false);
            }
            setLoading(false);
          })
          .catch(() => {
            setDireccion(null);
            setLoading(false);
          });
      });
  }, []);

  // Si la dirección tiene city como id y ya cargamos la lista de ciudades, mapear id -> nombre
  useEffect(() => {
    if (!direccion || ciudades.length === 0) return;
    const ciudadVal = direccion.ciudad;
    if (ciudadVal == null || ciudadVal === '') return;
    // Si es numérico (id), buscar nombre
    const isId = (typeof ciudadVal === 'number') || (/^\d+$/.test(String(ciudadVal)));
    if (isId) {
      const found = ciudades.find(c => c.id != null && String(c.id) === String(ciudadVal));
      if (found) {
        if (found.name !== direccion.ciudad) {
          setDireccion(d => ({ ...d, ciudad: found.name }));
        }
      }
    }
  }, [ciudades, direccion]);

  const handleContinuar = () => {
    // Validaciones mínimas: los campos deben existir y tener longitud mínima
    const getCiudadVal = val => {
      if (val == null) return '';
      // si viene como objeto {id,name}
      if (typeof val === 'object') return val.name || '';
      return String(val);
    };

    if (!usarOtra) {
      if (!direccion || !getCiudadVal(direccion.ciudad) || !direccion.direccion || !direccion.barrio) return;
      if (getCiudadVal(direccion.ciudad).trim().length < MIN_LENGTH || direccion.direccion.trim().length < MIN_LENGTH || direccion.barrio.trim().length < MIN_LENGTH) return;
      // Si tenemos lista de ciudades (por nombre), validar que la ciudad exista (aceptar coincidencia por id previo también)
      if (ciudades.length > 0) {
        const ciudadStr = getCiudadVal(direccion.ciudad).trim();
        const existePorNombre = ciudades.some(c => c.name.toLowerCase() === ciudadStr.toLowerCase());
        const existePorId = ciudades.some(c => String(c.id) === String(direccion.ciudad));
        if (!existePorNombre && !existePorId) return;
      }
    }
    if (usarOtra) {
      if (!otraDireccion.ciudad || !otraDireccion.direccion || !otraDireccion.barrio) return;
      if (otraDireccion.ciudad.trim().length < MIN_LENGTH || otraDireccion.direccion.trim().length < MIN_LENGTH || otraDireccion.barrio.trim().length < MIN_LENGTH) return;
      if (ciudades.length > 0 && !ciudades.some(c => c.name.toLowerCase() === otraDireccion.ciudad.trim().toLowerCase())) return;
    }
    if (setMetodoEnvio) setMetodoEnvio('domicilio');
    // Guardar dirección seleccionada en localStorage para el siguiente paso
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
              {!editarPerfil ? (
                <>
                  {direccion.direccion}{direccion.barrio ? `, Barrio ${direccion.barrio}` : ''}{direccion.ciudad ? `, ${direccion.ciudad}` : ''}
                  {faltanCamposPerfil && (
                    <div style={{ marginTop: 8, color: '#d97706' }}>
                      Tu perfil no tiene todos los campos de dirección (falta ciudad o barrio).<br />
                      <button
                        onClick={() => setEditarPerfil(true)}
                        style={{ marginTop: 8, background: '#ffb74d', color: '#000', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                      >Completar dirección</button>
                    </div>
                  )}
                </>
              ) : (
                // Inputs inline en la tarjeta superior para completar datos faltantes
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ciudad"
                    list="ciudades-list"
                    value={direccion.ciudad || ''}
                    onChange={e => setDireccion({ ...direccion, ciudad: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    style={{ maxWidth: 350 }}
                  />
                  {ciudades.length > 0 && (
                    <datalist id="ciudades-list">
                      {ciudades.map((c, idx) => <option key={idx} value={c.name} />)}
                    </datalist>
                  )}
                  <input
                    type="text"
                    placeholder="Barrio"
                    value={direccion.barrio || ''}
                    onChange={e => setDireccion({ ...direccion, barrio: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    style={{ maxWidth: 350 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button
                      onClick={() => {
                        // Validar mínimos y guardar localmente
                        const nombreCiudad = (direccion.ciudad || '').trim();
                        const barrioVal = (direccion.barrio || '').trim();
                        if (nombreCiudad.length < MIN_LENGTH) { setErrors(e => ({ ...e, ciudad: 'Ciudad inválida' })); return; }
                        if (barrioVal.length < MIN_LENGTH) { setErrors(e => ({ ...e, barrio: 'Barrio inválido' })); return; }
                        setFaltanCamposPerfil(false);
                        setEditarPerfil(false);
                        // No escribir al perfil en backend aquí; solo persistir para checkout
                        // localStorage se actualizarizará en handleContinuar
                      }}
                      style={{ background: '#2979ff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}
                    >Guardar</button>
                    <button
                      onClick={() => { setEditarPerfil(false); }}
                      style={{ background: '#e0e0e0', color: '#000', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}
                    >Cancelar</button>
                  </div>
                </div>
              )}
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
                  {ciudades.map((c, idx) => <option key={idx} value={c.name} />)}
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
            if (ciudades.length > 0 && direccion && !ciudades.some(c => c.name.toLowerCase() === direccion.ciudad.trim().toLowerCase())) { newErrors.ciudad = 'Ciudad no encontrada en la lista'; ok = false; }
          } else {
            if (!otraDireccion.ciudad || otraDireccion.ciudad.trim().length < MIN_LENGTH) { newErrors.ciudad = 'Ciudad inválida'; ok = false; }
            if (!otraDireccion.direccion || otraDireccion.direccion.trim().length < MIN_LENGTH) { newErrors.direccion = 'Dirección inválida'; ok = false; }
            if (!otraDireccion.barrio || otraDireccion.barrio.trim().length < MIN_LENGTH) { newErrors.barrio = 'Barrio inválido'; ok = false; }
            if (ciudades.length > 0 && !ciudades.some(c => c.name.toLowerCase() === otraDireccion.ciudad.trim().toLowerCase())) { newErrors.ciudad = 'Ciudad no encontrada en la lista'; ok = false; }
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
