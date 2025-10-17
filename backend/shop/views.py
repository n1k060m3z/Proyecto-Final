from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from .models import City
import logging
from .models import Subcategoria, Categoria, Producto, CarritoItem, Carrito, Pedido, PedidoItem, Usuario, SolicitudServicio, Calificacion
from django.db.models import Q, Avg, Count
from django.db import transaction

from .serializers import (
    ProductoSerializer,
    UsuarioSerializer,
    CustomTokenObtainPairSerializer,
    CarritoItemSerializer,
    CategoriaSerializer,
    SubcategoriaSerializer,
    PedidoSerializer,
    CalificacionSerializer,
)

class GetUserEmailView(APIView):
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Nombre de usuario requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'email': user.email}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Nombre de usuario requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        # Generar token simple
        token = get_random_string(32)
        user.reset_token = token
        user.save()
        reset_url = f"http://localhost:3000/reset-password/{token}/"
        send_mail(
            'Recuperación de contraseña',
            f'Hola {user.username}, para recuperar tu contraseña haz clic en el siguiente enlace: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return Response({'message': 'Correo de recuperación enviado'}, status=status.HTTP_200_OK)
# --- Vista para obtener el detalle de un producto por ID ---
from rest_framework import generics

# --- Vista para obtener el detalle de un producto por ID ---

# --- Vista para obtener el detalle de un producto por ID ---
from rest_framework.permissions import AllowAny
from .models import Producto
from .serializers import ProductoSerializer
class ProductoDetailView(generics.RetrieveAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Subcategoria, Categoria, Producto, CarritoItem, Carrito, Pedido, PedidoItem, Usuario
from .serializers import SubcategoriaSerializer, CategoriaSerializer, ProductoSerializer, UsuarioSerializer, CustomTokenObtainPairSerializer, CarritoItemSerializer
    # --- Vista para obtener una subcategoría por ID ---
class SubcategoriaDetailView(generics.RetrieveAPIView):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
    permission_classes = [AllowAny]

# --- Vista para obtener una categoría por ID ---
class CategoriaDetailView(generics.RetrieveAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .models import Producto, CarritoItem, Carrito, Pedido, PedidoItem, Categoria, Subcategoria
from .serializers import (
    ProductoSerializer,
    UsuarioSerializer,
    CustomTokenObtainPairSerializer,
    CarritoItemSerializer,
    CategoriaSerializer,
    SubcategoriaSerializer,
    PedidoSerializer,
    CalificacionSerializer,
)

Usuario = get_user_model()

# --- Serializer personalizado para login JWT ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['es_vendedor'] = self.user.es_vendedor
        return data

# --- Vista personalizada para login JWT ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- Vista pública para listar productos ---
class ProductoListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        if user and hasattr(user, 'es_vendedor') and user.es_vendedor:
            # Si es vendedor, mostrar todos sus productos (activos y pausados)
            productos = Producto.objects.filter(vendedor=user)
        else:
            # Si es cliente o no autenticado, solo productos activos
            productos = Producto.objects.filter(activo=True)
        serializer = ProductoSerializer(productos, many=True, context={'request': request})
        return Response(serializer.data)

# --- Vista privada para crear productos (solo vendedores autenticados) ---
class ProductoCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.es_vendedor:
            return Response(
                {"error": "Solo los vendedores pueden subir productos."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar ciudad del usuario automáticamente
            ciudad_usuario = request.user.city
            producto = serializer.save(vendedor=request.user, ciudad=ciudad_usuario)
            return Response(ProductoSerializer(producto, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Vista para registrar nuevos usuarios ---
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        es_vendedor = str(request.data.get('es_vendedor', 'false')).lower() == 'true'

        if not username or not email or not password:
            return Response(
                {'error': 'Todos los campos son obligatorios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Usuario.objects.filter(username=username).exists():
            return Response(
                {'error': 'El nombre de usuario ya está en uso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = Usuario.objects.create_user(
            username=username,
            email=email,
            password=password,
            es_vendedor=es_vendedor
        )

        return Response(
            {
                'message': 'Usuario registrado con éxito',
                'username': user.username,
                'es_vendedor': user.es_vendedor
            },
            status=status.HTTP_201_CREATED
        )

# --- Vista para listar y agregar items al carrito ---
class CarritoListCreateView(generics.ListCreateAPIView):
    serializer_class = CarritoItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CarritoItem.objects.filter(carrito__usuario=self.request.user)

    def perform_create(self, serializer):
        carrito, _ = Carrito.objects.get_or_create(usuario=self.request.user)
        serializer.save(carrito=carrito)

# --- Vista para eliminar item del carrito ---
from rest_framework.generics import RetrieveUpdateDestroyAPIView

# Vista para eliminar y actualizar item del carrito
class CarritoUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    serializer_class = CarritoItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return CarritoItem.objects.filter(carrito__usuario=self.request.user)

# --- Vista para crear un pedido (desde el carrito) ---
class PedidoCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger = logging.getLogger('django')
        usuario = request.user
        logger.warning(f"[PedidoCreateView] Usuario autenticado: {usuario} (is_authenticated={getattr(usuario, 'is_authenticated', False)}) payload={request.data}")

        carrito = Carrito.objects.filter(usuario=usuario).first()

        # Obtener ids de forma robusta (acepta: {items: [...]}, {ids: [...]}, lista directa, o string JSON)
        ids = None
        data = request.data
        try:
            if isinstance(data, list):
                ids = data
            else:
                # Try common keys
                ids = data.get('items') if hasattr(data, 'get') else None
                if ids is None:
                    ids = data.get('ids') if hasattr(data, 'get') else None
                # Si viene como QueryDict con getlist
                if not ids and hasattr(data, 'getlist'):
                    ids_list = data.getlist('items')
                    if ids_list:
                        ids = ids_list
                # Si viene como string JSON, intentar parsear
                if isinstance(ids, str):
                    import json
                    try:
                        ids = json.loads(ids)
                    except Exception:
                        # intentar como lista separada por comas
                        ids = [x.strip() for x in ids.split(',') if x.strip()]
        except Exception as e:
            logger.warning(f"[PedidoCreateView] Error al procesar payload: {e}")
            ids = None

        if not carrito or not carrito.items.exists():
            return Response({'error': 'El carrito está vacío'}, status=status.HTTP_400_BAD_REQUEST)

        if not ids or not isinstance(ids, (list, tuple)):
            logger.warning(f"[PedidoCreateView] IDs inválidos o no enviados: {ids}")
            return Response({'error': 'No se seleccionaron productos'}, status=status.HTTP_400_BAD_REQUEST)

        # Convertir a enteros cuando sea posible
        try:
            ids = [int(i) for i in ids]
        except Exception:
            return Response({'error': 'IDs de items inválidos'}, status=status.HTTP_400_BAD_REQUEST)

        items = carrito.items.filter(id__in=ids)
        if not items.exists():
            logger.warning(f"[PedidoCreateView] No se encontraron items en el carrito para los IDs solicitados. solicitados={ids} existentes={[i.id for i in carrito.items.all()]}")
            return Response({'error': 'No se encontraron productos seleccionados'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.producto.precio * item.cantidad for item in items)

        # Leer datos de entrega desde el payload (si vienen)
        entrega = {}
        if isinstance(data, dict):
            entrega = data.get('entrega', {}) or {}
        entrega_nombre = entrega.get('nombre') or entrega.get('entrega_nombre')
        entrega_correo = entrega.get('correo') or entrega.get('entrega_correo')
        entrega_telefono = entrega.get('telefono') or entrega.get('entrega_telefono')
        entrega_direccion = entrega.get('direccion') or entrega.get('entrega_direccion')
        entrega_ciudad = entrega.get('ciudad') or entrega.get('entrega_ciudad')
        entrega_barrio = entrega.get('barrio') or entrega.get('entrega_barrio')
        metodo_pago = data.get('metodo_pago') or entrega.get('metodo_pago')

        # Crear pedido dentro de una transacción y actualizar stock de productos
        updated_products = []
        try:
            with transaction.atomic():
                # Validar stock antes de crear
                for ci in items.select_related('producto'):
                    prod = ci.producto
                    if prod.stock is None:
                        prod.stock = 0
                    if prod.stock < ci.cantidad:
                        return Response({'error': f'Stock insuficiente para el producto {prod.nombre}'}, status=status.HTTP_400_BAD_REQUEST)

                pedido = Pedido.objects.create(
                    usuario=usuario,
                    total=total,
                    entrega_nombre=entrega_nombre,
                    entrega_correo=entrega_correo,
                    entrega_telefono=entrega_telefono,
                    entrega_direccion=entrega_direccion,
                    entrega_ciudad=entrega_ciudad,
                    entrega_barrio=entrega_barrio,
                    metodo_pago=metodo_pago
                )
                affected = set()
                for ci in items.select_related('producto'):
                    PedidoItem.objects.create(
                        pedido=pedido,
                        producto=ci.producto,
                        cantidad=ci.cantidad
                    )
                    # Decrementar stock; no marcar como inactivo automáticamente.
                    prod = ci.producto
                    prod.stock = max(0, prod.stock - ci.cantidad)
                    prod.save(update_fields=['stock'])
                    # Agregar estado actualizado para sincronizar frontend (activo se mantiene como lo dejó el vendedor)
                    if prod.id not in affected:
                        updated_products.append({'id': prod.id, 'stock': prod.stock, 'activo': prod.activo})
                        affected.add(prod.id)

                # Eliminar solo los seleccionados
                items.delete()
        except Exception as e:
            logger.warning(f"[PedidoCreateView] Error creando pedido: {e}")
            return Response({'error': 'No se pudo crear el pedido'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Devolver pedido creado y estados actualizados de productos para que el frontend pueda sincronizar
        serializer = PedidoSerializer(pedido, context={'request': request})
        return Response({'mensaje': 'Pedido creado exitosamente', 'pedido': serializer.data, 'updated_products': updated_products}, status=status.HTTP_201_CREATED)
# --- Vista para listar pedidos ---
class PedidoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Listar pedidos que contienen items del vendedor autenticado."""
        logger = logging.getLogger('django')
        logger.warning(f"[PedidoListView] Usuario autenticado: {request.user} (ID: {getattr(request.user, 'id', None)})")
        pedidos = Pedido.objects.filter(items__producto__vendedor=request.user).distinct().order_by('-creado')
        serializer = PedidoSerializer(pedidos, many=True, context={'request': request})
        return Response(serializer.data)

# --- Vista para listar productos por categoría ---
class ProductosPorCategoriaView(generics.ListAPIView):
    """Lista los productos de una categoría. Si el usuario es vendedor devuelve sus productos (incluyendo pausados),
    si es cliente o anónimo devuelve solo productos activos."""
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        user = self.request.user if self.request.user.is_authenticated else None
        if user and getattr(user, 'es_vendedor', False):
            return Producto.objects.filter(categoria_id=categoria_id, vendedor=user)
        return Producto.objects.filter(categoria_id=categoria_id, activo=True)
from .serializers import UsuarioPublicoSerializer, CitySerializer

class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]

class ProductosPorSubcategoriaView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        subcategoria_id = self.kwargs.get('subcategoria_id')
        user = self.request.user if self.request.user.is_authenticated else None
        if user and getattr(user, 'es_vendedor', False):
            return Producto.objects.filter(subcategoria_id=subcategoria_id, vendedor=user)
        return Producto.objects.filter(subcategoria_id=subcategoria_id, activo=True)

class ProductosEnOfertaPorCategoriaView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        user = self.request.user if self.request.user.is_authenticated else None
        categoria_ofertas = Categoria.objects.filter(nombre__iexact='Ofertas').first()
        if user and getattr(user, 'es_vendedor', False):
            if categoria_ofertas and str(categoria_id) == str(categoria_ofertas.id):
                return Producto.objects.filter(en_oferta=True, vendedor=user)
            return Producto.objects.filter(categoria_id=categoria_id, en_oferta=True, vendedor=user)
        if categoria_ofertas and str(categoria_id) == str(categoria_ofertas.id):
            return Producto.objects.filter(en_oferta=True, activo=True)
        return Producto.objects.filter(categoria_id=categoria_id, en_oferta=True, activo=True)

class ProductosPorVendedorView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        vendedor_id = self.kwargs.get('vendedor_id')
        return Producto.objects.filter(vendedor_id=vendedor_id, activo=True)

class ProductoRetrieveUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

class UsuarioPublicoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, usuario_id):
        try:
            user = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UsuarioPublicoSerializer(user)
        return Response(serializer.data)

class CityListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cities = City.objects.filter(country='CO').order_by('name')
        serializer = CitySerializer(cities, many=True)
        return Response(serializer.data)

class PedidoClienteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pedidos = Pedido.objects.filter(usuario=request.user).order_by('-creado')
        serializer = PedidoSerializer(pedidos, many=True, context={'request': request})
        return Response(serializer.data)

class CambiarRolUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        es_vendedor = request.data.get('es_vendedor')
        if es_vendedor is None:
            return Response({'error': 'Debes indicar el campo es_vendedor.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.es_vendedor = bool(es_vendedor)
        request.user.save()
        return Response({'message': 'Rol actualizado correctamente.', 'es_vendedor': request.user.es_vendedor}, status=status.HTTP_200_OK)

class VerificarPasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        password_actual = request.data.get('password_actual')
        if not password_actual or not request.user.check_password(password_actual):
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'ok': True})

class MisPublicacionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        productos = Producto.objects.filter(vendedor=request.user)
        serializer = ProductoSerializer(productos, many=True, context={'request': request})
        return Response(serializer.data)

class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data.copy()
        password_actual = data.pop('password_actual', None)
        nueva_password = data.get('password', None)
        # Si se va a cambiar la contraseña, verificar la actual
        if nueva_password:
            if not password_actual or not user.check_password(password_actual):
                return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(nueva_password)
            user.save()
            data.pop('password', None)
        # Si se cambian username/email, pedir password_actual
        if ('username' in data or 'email' in data) and not user.check_password(password_actual):
            return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UsuarioSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Vista para marcar un item de pedido como enviado ---
class MarcarPedidoItemEnviadoView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = PedidoItem.objects.get(id=item_id)
        except PedidoItem.DoesNotExist:
            return Response({'error': 'No existe el item'}, status=status.HTTP_404_NOT_FOUND)
        # Solo el vendedor del producto puede marcar como enviado
        if item.producto.vendedor != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        item.enviado = True
        item.save()
        # Intentar notificar por correo al comprador si tiene email
        try:
            if item.pedido and item.pedido.usuario and item.pedido.usuario.email:
                send_mail(
                    'Tu pedido fue enviado',
                    f'Hola {item.pedido.usuario.username},\n\nEl vendedor ha marcado como enviado el producto: {item.producto.nombre}.\nPronto recibirás la entrega.\n\nSaludos,\nFourShop',
                    settings.DEFAULT_FROM_EMAIL,
                    [item.pedido.usuario.email],
                    fail_silently=True,
                )
        except Exception:
            pass
        from .serializers import PedidoItemSerializer
        return Response(PedidoItemSerializer(item, context={'request': request}).data)

class CalificacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.db import transaction, IntegrityError
        data = request.data.copy()
        data['usuario'] = request.user.id
        serializer = CalificacionSerializer(data=data, partial=True)
        if serializer.is_valid():
            producto = serializer.validated_data.get('producto')
            solicitud = serializer.validated_data.get('solicitud_servicio')
            pedido_item = serializer.validated_data.get('pedido_item')
            targets = [bool(producto), bool(solicitud), bool(pedido_item)]
            if sum(targets) != 1:
                return Response({'error': 'Envía exactamente uno de los campos: producto, pedido_item o solicitud_servicio.'}, status=status.HTTP_400_BAD_REQUEST)

            if producto:
                if not PedidoItem.objects.filter(pedido__usuario=request.user, producto=producto).exists():
                    return Response({'error': 'No puedes calificar un producto que no compraste'}, status=status.HTTP_400_BAD_REQUEST)
                existe_global = Calificacion.objects.filter(usuario=request.user, producto=producto, pedido_item__isnull=True).exists()
                if existe_global:
                    return Response({'error': 'Ya has calificado este producto'}, status=status.HTTP_400_BAD_REQUEST)

            if pedido_item:
                if pedido_item.pedido.usuario != request.user:
                    return Response({'error': 'No puedes calificar una compra que no es tuya'}, status=status.HTTP_403_FORBIDDEN)
                existe = Calificacion.objects.filter(usuario=request.user, pedido_item=pedido_item).exists()
                if existe:
                    return Response({'error': 'Ya has calificado este pedido/item'}, status=status.HTTP_400_BAD_REQUEST)

            if solicitud:
                try:
                    solicitud_obj = SolicitudServicio.objects.get(id=solicitud.id)
                except SolicitudServicio.DoesNotExist:
                    return Response({'error': 'Solicitud no encontrada'}, status=status.HTTP_404_NOT_FOUND)
                if solicitud_obj.estado != 'aceptado':
                    return Response({'error': 'Sólo puedes calificar servicios aceptados'}, status=status.HTTP_400_BAD_REQUEST)
                if solicitud_obj.cliente != request.user:
                    return Response({'error': 'Sólo el cliente puede calificar este servicio'}, status=status.HTTP_403_FORBIDDEN)
                existe = Calificacion.objects.filter(usuario=request.user, solicitud_servicio=solicitud_obj).exists()
                if existe:
                    return Response({'error': 'Ya has calificado este servicio'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                with transaction.atomic():
                    cal = serializer.save()
                    if cal.pedido_item and not cal.producto:
                        try:
                            cal.producto = cal.pedido_item.producto
                            cal.save(update_fields=['producto'])
                        except Exception:
                            pass

                    target_prod = None
                    if cal.producto:
                        target_prod = cal.producto
                    elif cal.pedido_item:
                        target_prod = cal.pedido_item.producto

                    if target_prod:
                        try:
                            prod = Producto.objects.get(id=target_prod.id)
                            agg = Calificacion.objects.filter(Q(producto=prod) | Q(pedido_item__producto=prod)).aggregate(avg=Avg('valor'), count=Count('id'))
                            prod.average_rating = float(agg.get('avg')) if agg.get('avg') is not None else None
                            prod.rating_count = agg.get('count') or 0
                            prod.save(update_fields=['average_rating', 'rating_count'])
                        except Producto.DoesNotExist:
                            pass

                    if cal.solicitud_servicio:
                        try:
                            sol = SolicitudServicio.objects.get(id=cal.solicitud_servicio.id)
                            sol.calificacion_valor = cal.valor
                            sol.calificacion_comentario = cal.comentario
                            sol.save(update_fields=['calificacion_valor', 'calificacion_comentario'])
                        except SolicitudServicio.DoesNotExist:
                            pass

                    return Response(CalificacionSerializer(cal).data, status=status.HTTP_201_CREATED)
            except IntegrityError:
                return Response({'error': 'Ya existe una calificación para este usuario y objetivo'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CalificacionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        calificaciones = Calificacion.objects.filter(usuario=request.user).order_by('-creado')
        serializer = CalificacionSerializer(calificaciones, many=True)
        return Response(serializer.data)

class VendedorRatingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, vendedor_id):
        qs = Calificacion.objects.filter(
            Q(producto__vendedor_id=vendedor_id) | Q(solicitud_servicio__vendedor_id=vendedor_id)
        )
        overall = qs.aggregate(avg=Avg('valor'), count=Count('id'))
        productos_qs = Calificacion.objects.filter(producto__vendedor_id=vendedor_id)
        servicios_qs = Calificacion.objects.filter(solicitud_servicio__vendedor_id=vendedor_id)
        productos = productos_qs.aggregate(avg=Avg('valor'), count=Count('id'))
        servicios = servicios_qs.aggregate(avg=Avg('valor'), count=Count('id'))

        def norm(x):
            return float(x) if x is not None else None

        data = {
            'average': norm(overall.get('avg')),
            'count': overall.get('count') or 0,
            'average_products': norm(productos.get('avg')),
            'count_products': productos.get('count') or 0,
            'average_services': norm(servicios.get('avg')),
            'count_services': servicios.get('count') or 0,
        }
        return Response(data)
