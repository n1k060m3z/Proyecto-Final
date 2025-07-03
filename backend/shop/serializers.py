from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Producto, Usuario, CarritoItem

# --- Serializer para Productos ---
class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'


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
