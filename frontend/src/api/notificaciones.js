import { getSolicitudesServicio, getPedidosCliente, getProductosVendidos } from './ventas';

export async function calcularNotificaciones(usuario) {
  if (!usuario) return { perfil: false, compras: false, ventas: false, notifKey: null };
  const solicitudes = await getSolicitudesServicio();
  let notifCompras = false, notifVentas = false;
  let notifKeyParts = [];

  const relevantes = solicitudes.filter(s =>
    (s.cliente === usuario.id || s.vendedor === usuario.id) &&
    ['pendiente','aceptado','rechazado','negociacion'].includes(s.estado)
  );
  if (relevantes.length > 0) {
    const ultima = relevantes.reduce((a, b) => (a.id > b.id ? a : b));
    const key = `sol-${ultima.id}-${ultima.estado}-${ultima.fecha_propuesta||''}-${ultima.hora_propuesta||''}`;
    notifCompras = relevantes.some(s => s.cliente === usuario.id);
    notifVentas = relevantes.some(s => s.vendedor === usuario.id);
    notifKeyParts.push(key);
  }

  // Revisar pedidos del comprador (items marcados como enviados)
  try {
    const pedidosCliente = await getPedidosCliente();
    // buscar el último item que tenga enviado === true
    let ultimoEnviadoItemId = null;
    for (const p of pedidosCliente) {
      if (Array.isArray(p.items)) {
        for (const it of p.items) {
          if (it.enviado) {
            if (!ultimoEnviadoItemId || it.id > ultimoEnviadoItemId) ultimoEnviadoItemId = it.id;
          }
        }
      }
    }
    if (ultimoEnviadoItemId) {
      notifCompras = true;
      notifKeyParts.push(`enviado-${ultimoEnviadoItemId}`);
    }
  } catch (e) {
    // ignorar errores de pedidos cliente
  }

  // Revisar pedidos para vendedor (nuevos pedidos que aún no han sido enviados)
  try {
    const pedidosVendedor = await getProductosVendidos();
    // getProductosVendidos devuelve pedidos del vendedor (cada pedido contiene solo items del vendedor)
    let ultimoItemPendienteId = null;
    for (const p of pedidosVendedor) {
      if (Array.isArray(p.items)) {
        for (const it of p.items) {
          if (!it.enviado) {
            if (!ultimoItemPendienteId || it.id > ultimoItemPendienteId) ultimoItemPendienteId = it.id;
          }
        }
      }
    }
    if (ultimoItemPendienteId) {
      notifVentas = true;
      notifKeyParts.push(`pedido-${ultimoItemPendienteId}`);
    }
  } catch (e) {
    // ignorar errores
  }

  const notifKey = notifKeyParts.length > 0 ? notifKeyParts.join('|') : null;
  return {
    perfil: !!notifKey,
    compras: notifCompras,
    ventas: notifVentas,
    notifKey
  };
}
