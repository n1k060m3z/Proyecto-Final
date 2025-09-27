import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Volver from '../../components/Volver';
import api from '../../api/axios';

const CheckoutEnvio = ({ setMetodoEnvio }) => {
  const [direccion, setDireccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usarOtra, setUsarOtra] = useState(false);
  const [otraDireccion, setOtraDireccion] = useState({ ciudad: '', direccion: '', barrio: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('perfil/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setDireccion(res.data.direccion);
        setLoading(false);
      })
      .catch(() => {
        setDireccion(null);
        setLoading(false);
      });
  }, []);

  const handleContinuar = () => {
    if (!usarOtra && !direccion) return;
    if (usarOtra && (!otraDireccion.ciudad || !otraDireccion.direccion || !otraDireccion.barrio)) return;
    if (setMetodoEnvio) setMetodoEnvio('domicilio');
    // Aquí podrías guardar la dirección alternativa en el estado global o enviarla al backend si lo deseas
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
            <div style={{ color: '#555', fontSize: 15 }}>{direccion}</div>
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
                value={otraDireccion.ciudad}
                onChange={e => setOtraDireccion({ ...otraDireccion, ciudad: e.target.value })}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
              <input
                type="text"
                placeholder="Dirección"
                value={otraDireccion.direccion}
                onChange={e => setOtraDireccion({ ...otraDireccion, direccion: e.target.value })}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
              <input
                type="text"
                placeholder="Barrio"
                value={otraDireccion.barrio}
                onChange={e => setOtraDireccion({ ...otraDireccion, barrio: e.target.value })}
                className="w-full border rounded px-3 py-2"
                style={{ maxWidth: 350 }}
              />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleContinuar}
        style={{ marginTop: 24, background: (!usarOtra && direccion) || (usarOtra && otraDireccion.ciudad && otraDireccion.direccion && otraDireccion.barrio) ? '#2979ff' : '#bbb', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 32px', fontSize: 18, fontWeight: 600, cursor: (!usarOtra && direccion) || (usarOtra && otraDireccion.ciudad && otraDireccion.direccion && otraDireccion.barrio) ? 'pointer' : 'not-allowed' }}
        disabled={(!usarOtra && !direccion) || (usarOtra && (!otraDireccion.ciudad || !otraDireccion.direccion || !otraDireccion.barrio))}
      >
        Continuar
      </button>
    </div>
  );
};

export default CheckoutEnvio;
