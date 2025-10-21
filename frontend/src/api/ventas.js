import api from './axios';

export const getSolicitudesServicio = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('solicitudes-servicio/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateSolicitudServicio = async (id, estado) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`solicitudes-servicio/${id}/`, { estado }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const negociarSolicitudServicio = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`solicitudes-servicio/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const aceptarPropuestaServicio = async (id) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`solicitudes-servicio/${id}/`, { aceptar_propuesta: true }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getProductosVendidos = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('pedido/list/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteSolicitud = async (id) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`solicitudes-servicio/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const marcarPedidoItemEnviado = async (itemId) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`pedido-item/${itemId}/enviar/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const crearPedido = async (items, entrega = {}, metodo_pago = '', shipping = 0) => {
  const token = localStorage.getItem('token');
  const payload = { items, entrega, metodo_pago, shipping };
  const response = await api.post('pedido/', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPedidosCliente = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('pedido/cliente/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const crearCalificacion = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('calificaciones/', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Para compatibilidad con el import en Ventas.js
getSolicitudesServicio.deleteSolicitud = deleteSolicitud;
