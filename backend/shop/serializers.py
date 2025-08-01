from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Producto, Usuario, CarritoItem, Categoria, Subcategoria

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
    vendedor = serializers.PrimaryKeyRelatedField(read_only=True)
    precio_con_descuento = serializers.SerializerMethodField()
    activo = serializers.BooleanField(default=True)  # <-- Agregado campo activo

    class Meta:
        model = Producto
        fields = [
            'id', 'vendedor', 'nombre', 'descripcion', 'precio', 'imagen',
            'categoria', 'categoria_id', 'subcategoria', 'en_oferta', 'descuento',
            'precio_con_descuento', 'subcategoria_id', 'activo', 'stock'
        ]

    def get_precio_con_descuento(self, obj):
        if obj.en_oferta and obj.descuento > 0:
            return float(obj.precio) * (1 - obj.descuento / 100)
        return float(obj.precio)

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

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'telefono', 'es_vendedor']

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            telefono=validated_data.get('telefono', ''),
            es_vendedor=validated_data.get('es_vendedor', False)
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
