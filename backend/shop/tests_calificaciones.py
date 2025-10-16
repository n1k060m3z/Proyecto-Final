from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Producto, Pedido, PedidoItem, SolicitudServicio, Calificacion
from django.utils import timezone

User = get_user_model()

class CalificacionAPITest(TestCase):
    def setUp(self):
        # Crear usuario vendedor y comprador
        self.vendedor = User.objects.create_user(username='seller', password='pass', es_vendedor=True)
        self.comprador = User.objects.create_user(username='buyer', password='pass', es_vendedor=False)
        # Crear producto del vendedor
        self.producto = Producto.objects.create(vendedor=self.vendedor, nombre='Test Product', descripcion='Desc', precio=100.0)
        # Crear pedido y item para simular compra
        self.pedido = Pedido.objects.create(usuario=self.comprador, total=100.0)
        self.pedido_item = PedidoItem.objects.create(pedido=self.pedido, producto=self.producto, cantidad=1)
        # Crear solicitud de servicio aceptada
        self.solicitud = SolicitudServicio.objects.create(servicio=self.producto, cliente=self.comprador, vendedor=self.vendedor, estado='aceptado')
        self.client = APIClient()

    def test_calificar_producto_actualiza_promedio_y_cuenta(self):
        # Autenticar como comprador
        self.client.force_authenticate(user=self.comprador)
        # Postear calificacion
        res = self.client.post('/api/calificaciones/', {'producto': self.producto.id, 'valor': 5, 'comentario': 'Muy bueno'})
        self.assertEqual(res.status_code, 201, msg=res.data)
        # Verificar que existe la calificacion
        cal = Calificacion.objects.filter(usuario=self.comprador, producto=self.producto).first()
        self.assertIsNotNone(cal)
        self.assertEqual(cal.valor, 5)
        # Refrescar producto
        prod = Producto.objects.get(id=self.producto.id)
        self.assertEqual(prod.rating_count, 1)
        self.assertAlmostEqual(prod.average_rating, 5.0)

        # Intentar calificar de nuevo (debe fallar)
        res2 = self.client.post('/api/calificaciones/', {'producto': self.producto.id, 'valor': 4})
        self.assertEqual(res2.status_code, 400)

    def test_calificar_servicio_guarda_en_solicitud_y_no_permite_duplicado(self):
        self.client.force_authenticate(user=self.comprador)
        res = self.client.post('/api/calificaciones/', {'solicitud_servicio': self.solicitud.id, 'valor': 4, 'comentario': 'OK'})
        self.assertEqual(res.status_code, 201, msg=res.data)
        cal = Calificacion.objects.filter(usuario=self.comprador, solicitud_servicio=self.solicitud).first()
        self.assertIsNotNone(cal)
        self.assertEqual(cal.valor, 4)
        # verificar solicitud actualizada
        sol = SolicitudServicio.objects.get(id=self.solicitud.id)
        self.assertEqual(sol.calificacion_valor, 4)

        # Intentar duplicar
        res2 = self.client.post('/api/calificaciones/', {'solicitud_servicio': self.solicitud.id, 'valor': 3})
        self.assertEqual(res2.status_code, 400)

    def test_calificaciones_lista_mis(self):
        # Crear una calificacion directa en BD
        Calificacion.objects.create(usuario=self.comprador, producto=self.producto, valor=5)
        self.client.force_authenticate(user=self.comprador)
        res = self.client.get('/api/calificaciones/mis/')
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.data, list)
        self.assertGreaterEqual(len(res.data), 1)
