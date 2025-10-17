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
    # Aceptar tanto id como nombre desde el cliente: recibimos strings (nombre) o ids.
    ciudad = serializers.CharField(allow_null=True, required=False)
    ciudad_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SolicitudServicio
        fields = [
            'id', 'servicio', 'servicio_nombre', 'cliente', 'cliente_nombre', 'vendedor', 'vendedor_nombre',
            'fecha_solicitud', 'estado', 'detalles', 'fecha', 'hora',
            'direccion', 'barrio', 'ciudad', 'ciudad_nombre',
            'fecha_propuesta', 'hora_propuesta', 'ultima_propuesta_por'
        ]

    def get_ciudad_nombre(self, obj):
        return obj.ciudad.name if getattr(obj, 'ciudad', None) else None
