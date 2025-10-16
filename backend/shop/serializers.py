from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Producto, Usuario, CarritoItem, Categoria, Subcategoria, City, Pedido, PedidoItem, SolicitudServicio, Calificacion

# --- Serializer para Subcategoria ---
class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategoria
        fields = '__all__'


# --- Serializer para Categoria ---
class CategoriaSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'subcategorias']


# --- Serializer para Productos ---
class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True, required=False
    )
    vendedor = serializers.SerializerMethodField()
    precio_con_descuento = serializers.SerializerMethodField()
    activo = serializers.BooleanField(default=True)  # <-- Agregado campo activo
    ciudad = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), required=False, allow_null=True)
    ciudad_vendedor = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'vendedor', 'nombre', 'descripcion', 'precio', 'imagen',
            'categoria', 'categoria_id', 'subcategoria', 'en_oferta', 'descuento',
            'precio_con_descuento', 'subcategoria_id', 'activo', 'stock', 'ciudad', 'ciudad_vendedor',
            'average_rating', 'rating_count'
        ]

    def get_vendedor(self, obj):
        if obj.vendedor:
            return {
                'id': obj.vendedor.id,
                'username': obj.vendedor.username,
                'email': obj.vendedor.email
            }
        return None
    
    def to_representation(self, instance):
        # Asegurarse de que la URL de imagen sea absoluta si hay request en contexto
        rep = super().to_representation(instance)
        request = self.context.get('request') if hasattr(self, 'context') else None
        if rep.get('imagen') and request:
            # Ya debería venir como URL absoluta si ImageField y context se pasaron, pero dejamos la normalización por seguridad
            if rep['imagen'].startswith('/'):
                rep['imagen'] = request.build_absolute_uri(rep['imagen'])
        return rep

    def get_precio_con_descuento(self, obj):
        if obj.en_oferta and obj.descuento > 0:
            return float(obj.precio) * (1 - obj.descuento / 100)
        return float(obj.precio)

    def get_ciudad_vendedor(self, obj):
        import logging
        logger = logging.getLogger('django')
        ciudad = None
        if hasattr(obj.vendedor, 'city') and obj.vendedor.city:
            ciudad = obj.vendedor.city.name
        logger.warning(f"[ProductoSerializer] Producto: {obj.id}, Vendedor: {getattr(obj.vendedor, 'username', None)}, Ciudad vendedor: {ciudad}")
        return ciudad

    def update(self, instance, validated_data):
        # Eliminar la lógica de cambio de categoría al activar/desactivar oferta
        # Solo se actualizan los campos normales
        return super().update(instance, validated_data)


# --- Serializer para Items del Carrito ---
class CarritoItemSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(), source='producto', write_only=True
    )

    class Meta:
        model = CarritoItem
        fields = ['id', 'producto', 'producto_id', 'cantidad']


# --- Serializer para Usuarios ---
class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'password', 'telefono', 'es_vendedor', 'direccion',
            'descripcion_perfil', 'tiene_local', 'direccion_local', 'celular_contacto', 'city'
        ]

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            telefono=validated_data.get('telefono', ''),
            es_vendedor=validated_data.get('es_vendedor', False),
            direccion=validated_data.get('direccion', ''),
            city=validated_data.get('city')
        )
        return user


# --- Serializer personalizado para login JWT ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['es_vendedor'] = user.es_vendedor
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['es_vendedor'] = self.user.es_vendedor
        return data

# --- Serializer público para mostrar solo datos públicos del usuario ---
class UsuarioPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'descripcion_perfil', 'tiene_local', 'direccion_local', 'celular_contacto'
        ]

# --- Serializer para City ---
class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'country']

# --- Serializer para Items de Pedido ---
class PedidoItemSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    es_servicio = serializers.SerializerMethodField()

    class Meta:
        model = PedidoItem
        fields = ['id', 'producto', 'cantidad', 'enviado', 'es_servicio']

    def get_es_servicio(self, obj):
        try:
            # Verificar si existe una solicitud de servicio para este producto entre el comprador (pedido.usuario) y el vendedor
            pedido = getattr(obj, 'pedido', None)
            if pedido is None:
                return False
            return SolicitudServicio.objects.filter(servicio=obj.producto, cliente=pedido.usuario, vendedor=obj.producto.vendedor).exists()
        except Exception:
            return False

class PedidoSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    class Meta:
        model = Pedido
        fields = ['id', 'usuario', 'usuario_username', 'creado', 'total', 'items']

    def get_items(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        from .serializers import PedidoItemSerializer
        # Si el usuario autenticado es el comprador del pedido, devolver todos los items
        if user and obj.usuario == user:
            items = obj.items.all()
        else:
            # Solo incluir los items cuyo producto pertenece al usuario autenticado (vendedor)
            items = obj.items.filter(producto__vendedor=user)
        # Pasar el contexto (contiene request) para que ImageField genere URLs absolutas
        return PedidoItemSerializer(items, many=True, context=self.context).data

# --- Serializer para Calificacion ---
class CalificacionSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all(), required=False, allow_null=True)
    pedido_item = serializers.PrimaryKeyRelatedField(queryset=PedidoItem.objects.all(), required=False, allow_null=True)
    solicitud_servicio = serializers.PrimaryKeyRelatedField(queryset=SolicitudServicio.objects.all(), required=False, allow_null=True)
    class Meta:
        model = Calificacion
        fields = ['id', 'usuario', 'usuario_username', 'producto', 'pedido_item', 'solicitud_servicio', 'valor', 'comentario', 'creado']
        extra_kwargs = {
            'pedido_item': {'required': False, 'allow_null': True},
            'producto': {'required': False, 'allow_null': True},
            'solicitud_servicio': {'required': False, 'allow_null': True},
        }
        # Evitar que DRF agregue validadores automáticos (e.g., unique_together) que requieren campos opcionales
        validators = []

# --- Serializer para Solicitud de Servicio ---
class SolicitudServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.username', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.username', read_only=True)
    cliente = serializers.PrimaryKeyRelatedField(read_only=True)
    # Exponer calificación si existe
    calificacion_valor = serializers.IntegerField(read_only=True)
    calificacion_comentario = serializers.CharField(read_only=True)

    class Meta:
        model = SolicitudServicio
        fields = [
            'id', 'servicio', 'servicio_nombre', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre',
            'fecha_solicitud', 'estado', 'detalles', 'fecha', 'hora',
            'fecha_propuesta', 'hora_propuesta', 'ultima_propuesta_por',
            'calificacion_valor', 'calificacion_comentario'
        ]
