from django.contrib.auth import get_user_model
from shop.models import Producto, Pedido, PedidoItem, Calificacion
from rest_framework.test import APIClient

User = get_user_model()
comprador = User.objects.filter(es_vendedor=False).first()
vendedor = User.objects.filter(es_vendedor=True).first()
p = Producto.objects.filter(activo=True).first()
print('USUARIO comprador:', comprador.id, comprador.username)
print('VENDEDOR:', vendedor.id, vendedor.username if vendedor else None)
print('PRODUCTO:', p.id, p.nombre)

client = APIClient()
client.force_authenticate(user=comprador)

prod_before = Producto.objects.get(id=p.id)
print('ANTES AVG,COUNT:', prod_before.average_rating, prod_before.rating_count)

item = PedidoItem.objects.filter(pedido__usuario=comprador, producto=p).first()
if not item:
    pedido = Pedido.objects.create(usuario=comprador, total=p.precio)
    item = PedidoItem.objects.create(pedido=pedido, producto=p, cantidad=1)

print('PedidoItem id:', item.id)

# Crear calificación asociada a pedido_item
res = client.post('/api/calificaciones/', {'pedido_item': item.id, 'valor': 5, 'comentario': 'Prueba automatizada'}, format='json')
print('POST pedido_item STATUS:', res.status_code)
print('POST pedido_item DATA:', getattr(res, 'data', str(res.content)[:1000]))

prod_after = Producto.objects.get(id=p.id)
print('DESPUÉS AVG,COUNT:', prod_after.average_rating, prod_after.rating_count)

# Intento duplicado
res2 = client.post('/api/calificaciones/', {'pedido_item': item.id, 'valor': 4, 'comentario': 'Intento duplicado'}, format='json')
print('DUP STATUS:', res2.status_code)
print('DUP DATA:', getattr(res2, 'data', str(res2.content)[:1000]))

# Crear calificación global por producto si no existe
if not Calificacion.objects.filter(usuario=comprador, producto=p, pedido_item__isnull=True).exists():
    res3 = client.post('/api/calificaciones/', {'producto': p.id, 'valor': 3, 'comentario': 'Global producto'}, format='json')
    print('GLOBAL POST STATUS:', res3.status_code)
    print('GLOBAL POST DATA:', getattr(res3, 'data', str(res3.content)[:1000]))
    p2 = Producto.objects.get(id=p.id)
    print('FINAL AVG,COUNT:', p2.average_rating, p2.rating_count)
else:
    print('Ya existe calificación global para este usuario y producto')

# Listar calificaciones del usuario
from shop.models import Calificacion
cals = Calificacion.objects.filter(usuario=comprador)
print('MIS CALIFICACIONES:')
for c in cals:
    print('-', c.id, 'producto', getattr(c.producto, 'id', None), 'pedido_item', getattr(c.pedido_item, 'id', None), 'solicitud', getattr(c.solicitud_servicio, 'id', None), 'valor', c.valor)
