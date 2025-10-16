from rest_framework import serializers
from .models import SolicitudServicio, Producto, Usuario, City

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name']

class SolicitudServicioSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.username', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.username', read_only=True)
    cliente = serializers.PrimaryKeyRelatedField(read_only=True)
    ciudad = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), allow_null=True, required=False)

    class Meta:
        model = SolicitudServicio
        fields = [
            'id', 'servicio', 'servicio_nombre', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre',
            'fecha_solicitud', 'estado', 'detalles', 'fecha', 'hora',
            'direccion', 'barrio', 'ciudad',
            'fecha_propuesta', 'hora_propuesta', 'ultima_propuesta_por'
        ]
