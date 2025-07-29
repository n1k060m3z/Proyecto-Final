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
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
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
            serializer.save(vendedor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
class CarritoDeleteView(generics.DestroyAPIView):
    serializer_class = CarritoItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return CarritoItem.objects.filter(usuario=self.request.user)

# --- Vista para crear un pedido (desde el carrito) ---
class PedidoCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        usuario = request.user
        carrito = Carrito.objects.filter(usuario=usuario).first()

        if not carrito or not carrito.items.exists():
            return Response({'error': 'El carrito está vacío'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.producto.precio * item.cantidad for item in carrito.items.all())

        pedido = Pedido.objects.create(usuario=usuario, total=total)

        for item in carrito.items.all():
            PedidoItem.objects.create(
                pedido=pedido,
                producto=item.producto,
                cantidad=item.cantidad
            )

        carrito.items.all().delete()

        return Response({'mensaje': 'Pedido creado exitosamente'}, status=status.HTTP_201_CREATED)

# --- Vista para listar productos por categoría ---
class ProductosPorCategoriaView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        # Solo productos que realmente tienen la categoría asignada
        return Producto.objects.filter(categoria_id=categoria_id)

# --- Vista para listar categorías ---
class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]

# --- Vista para cambiar rol de usuario ---
class CambiarRolUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        es_vendedor = request.data.get('es_vendedor')
        if es_vendedor is None:
            return Response({'error': 'Debes indicar el campo es_vendedor.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.es_vendedor = bool(es_vendedor)
        request.user.save()
        return Response({
            'message': 'Rol actualizado correctamente.',
            'es_vendedor': request.user.es_vendedor
        }, status=status.HTTP_200_OK)

# --- Vista para obtener y actualizar el perfil del usuario autenticado ---
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
        # Si se va a cambiar el password, verificar el actual
        if nueva_password:
            if not password_actual or not user.check_password(password_actual):
                return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(nueva_password)
            user.save()
            data.pop('password', None)
        # Si solo se cambian otros datos, también pedir password_actual
        if ('username' in data or 'email' in data) and not user.check_password(password_actual):
            return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UsuarioSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Endpoint para verificar password actual (solo para seguridad) ---
from rest_framework.views import APIView
class VerificarPasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        password_actual = request.data.get('password_actual')
        if not password_actual or not request.user.check_password(password_actual):
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'ok': True})

# --- Vista para listar productos del usuario autenticado (vendedor) ---
class MisPublicacionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        productos = Producto.objects.filter(vendedor=request.user)
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)

from rest_framework.generics import RetrieveUpdateDestroyAPIView

# --- Vista para obtener, actualizar y eliminar un producto por ID (detalle) ---
class ProductoRetrieveUpdateView(RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

# --- Vista para listar productos por subcategoría ---
class ProductosPorSubcategoriaView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        subcategoria_id = self.kwargs.get('subcategoria_id')
        # Solo productos que realmente tienen la subcategoría asignada
        return Producto.objects.filter(subcategoria_id=subcategoria_id)

# --- Vista para listar productos en oferta por categoría ---
class ProductosEnOfertaPorCategoriaView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        # Mostrar productos en oferta de cualquier categoría si categoria_id es la de "Ofertas"
        categoria_ofertas = Categoria.objects.filter(nombre__iexact='Ofertas').first()
        if categoria_ofertas and str(categoria_id) == str(categoria_ofertas.id):
            return Producto.objects.filter(en_oferta=True)
        # Si no, mostrar solo los productos en oferta de la categoría seleccionada
        return Producto.objects.filter(categoria_id=categoria_id, en_oferta=True)
