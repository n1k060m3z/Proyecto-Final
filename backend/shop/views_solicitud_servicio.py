from django.db import models
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from .models import SolicitudServicio, City
from .serializers_solicitud_servicio import SolicitudServicioSerializer
from datetime import date

class SolicitudServicioListCreateView(generics.ListCreateAPIView):
    serializer_class = SolicitudServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Mostrar todas las solicitudes donde el usuario es cliente o vendedor
        return SolicitudServicio.objects.filter(models.Q(cliente=user) | models.Q(vendedor=user)).distinct()

    def perform_create(self, serializer):
        # El cliente crea la solicitud
        data = self.request.data
        user = self.request.user
        # Si no se envía dirección, tomar desde el perfil del usuario
        direccion = data.get('direccion') or user.direccion or ''
        barrio = data.get('barrio') or getattr(user, 'barrio', '') or ''
        ciudad_input = data.get('ciudad') or (user.city.id if getattr(user, 'city', None) else None)
        ciudad_obj = None
        # Resolver ciudad_input que puede ser id o nombre
        if ciudad_input:
            try:
                # intentar interpretar como entero (id)
                ciudad_obj = City.objects.get(pk=int(ciudad_input))
            except Exception:
                # intentar por nombre (case-insensitive)
                ciudad_obj = City.objects.filter(name__iexact=str(ciudad_input)).first()
        # Validar fecha (no permitir fechas pasadas)
        fecha = data.get('fecha')
        if fecha:
            try:
                fecha_obj = date.fromisoformat(fecha)
                if fecha_obj < date.today():
                    raise serializers.ValidationError({'fecha': 'No se permiten fechas pasadas'})
            except serializers.ValidationError:
                raise
            except Exception:
                raise serializers.ValidationError({'fecha': 'Fecha inválida'})
        serializer.save(cliente=user, direccion=direccion, barrio=barrio, ciudad=ciudad_obj)

class SolicitudServicioUpdateView(generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = SolicitudServicio.objects.all()
    serializer_class = SolicitudServicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        solicitud = self.get_object()
        user = request.user
        data = request.data
        # Permitir que tanto vendedor como cliente negocien
        if user != solicitud.vendedor and user != solicitud.cliente:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        # Si el vendedor propone nueva fecha/hora
        if user == solicitud.vendedor and (data.get('fecha_propuesta') or data.get('hora_propuesta')):
            solicitud.fecha_propuesta = data.get('fecha_propuesta', solicitud.fecha_propuesta)
            solicitud.hora_propuesta = data.get('hora_propuesta', solicitud.hora_propuesta)
            solicitud.ultima_propuesta_por = 'vendedor'
            solicitud.estado = 'negociacion'
            solicitud.save()
            return Response(self.get_serializer(solicitud).data)

        # Si el cliente acepta la propuesta del vendedor
        if user == solicitud.cliente and data.get('aceptar_propuesta'):
            solicitud.fecha = solicitud.fecha_propuesta
            solicitud.hora = solicitud.hora_propuesta
            solicitud.estado = 'aceptado'
            solicitud.save()
            return Response(self.get_serializer(solicitud).data)

        # Si el cliente contraoferta (propone nueva fecha/hora)
        if user == solicitud.cliente and (data.get('fecha') or data.get('hora')):
            solicitud.fecha = data.get('fecha', solicitud.fecha)
            solicitud.hora = data.get('hora', solicitud.hora)
            solicitud.ultima_propuesta_por = 'cliente'
            solicitud.estado = 'negociacion'
            solicitud.save()
            return Response(self.get_serializer(solicitud).data)

        # Aceptar o rechazar (solo vendedor)
        if user == solicitud.vendedor and data.get('estado') in ['aceptado', 'rechazado']:
            if data.get('estado') == 'rechazado':
                # Si el vendedor rechaza, eliminar la solicitud inmediatamente
                solicitud.delete()
                return Response({'mensaje': 'Solicitud rechazada y eliminada'}, status=status.HTTP_200_OK)
            else:
                solicitud.estado = 'aceptado'
                solicitud.save()
                return Response(self.get_serializer(solicitud).data)

        return Response({'error': 'Operación no válida'}, status=status.HTTP_400_BAD_REQUEST)
