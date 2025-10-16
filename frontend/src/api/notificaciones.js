import { getSolicitudesServicio } from './ventas';

export async function calcularNotificaciones(usuario) {
  if (!usuario) return { perfil: false, compras: false, ventas: false };
  const solicitudes = await getSolicitudesServicio();
  let notifCompras = false, notifVentas = false;
  let notifKey = null;
  const relevantes = solicitudes.filter(s =>
    (s.cliente === usuario.id || s.vendedor === usuario.id) &&
    ['pendiente','aceptado','rechazado','negociacion'].includes(s.estado)
  );
  if (relevantes.length > 0) {
    const ultima = relevantes.reduce((a, b) => (a.id > b.id ? a : b));
    notifKey = `${ultima.id}-${ultima.estado}-${ultima.fecha_propuesta||''}-${ultima.hora_propuesta||''}`;
    notifCompras = relevantes.some(s => s.cliente === usuario.id);
    notifVentas = relevantes.some(s => s.vendedor === usuario.id);
  }
  // Mostrar viñeta en barra superior y en botones de compras/ventas
  return {
    perfil: !!notifKey,
    compras: notifCompras,
    ventas: notifVentas
  };
}
