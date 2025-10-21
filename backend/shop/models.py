from django.db import models
from django.contrib.auth.models import AbstractUser


class City(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=2, default='CO')  # ISO 3166-1 alpha-2 para Colombia

    def __str__(self):
        return self.name


class Usuario(AbstractUser):
    es_vendedor = models.BooleanField(default=False)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    reset_token = models.CharField(max_length=64, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    barrio = models.CharField(max_length=150, blank=True, null=True)
    city = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True, related_name='usuarios')
    # NUEVOS CAMPOS PERFIL DE VENTAS
    descripcion_perfil = models.CharField(max_length=500, blank=True, null=True)
    tiene_local = models.BooleanField(default=False)
    direccion_local = models.CharField(max_length=150, blank=True, null=True)
    celular_contacto = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.username

    @property
    def es_comprador(self):
        return not self.es_vendedor


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre


class Subcategoria(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.ForeignKey('Categoria', on_delete=models.CASCADE, related_name='subcategorias')

    def __str__(self):
        return f"{self.nombre} ({self.categoria.nombre})"


class Producto(models.Model):
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    categoria = models.ForeignKey('Categoria', on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    subcategoria = models.ForeignKey('Subcategoria', on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    ciudad = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    en_oferta = models.BooleanField(default=False)  # Cambia el valor por defecto a False
    descuento = models.PositiveIntegerField(default=0, help_text='Porcentaje de descuento (0-100)')
    activo = models.BooleanField(default=True, help_text='Indica si el producto está activo (True) o pausado (False)')
    stock = models.PositiveIntegerField(default=1, help_text='Unidades disponibles en inventario')
    # Campos para calificaciones agregados: promedio y cantidad de reseñas
    average_rating = models.FloatField(null=True, blank=True)
    rating_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.nombre


class Carrito(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='carrito')

    def __str__(self):
        return f"Carrito de {self.usuario.username}"

    @property
    def total(self):
        return sum(item.producto.precio * item.cantidad for item in self.items.all())


class CarritoItem(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('carrito', 'producto')

    def __str__(self):
        return f'{self.producto.nombre} x {self.cantidad}'


class Pedido(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='pedidos')
    creado = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)

    # Campos para datos de entrega (persistir la info ingresada en checkout)
    entrega_nombre = models.CharField(max_length=150, blank=True, null=True)
    entrega_correo = models.CharField(max_length=150, blank=True, null=True)
    entrega_telefono = models.CharField(max_length=50, blank=True, null=True)
    entrega_direccion = models.CharField(max_length=255, blank=True, null=True)
    entrega_ciudad = models.CharField(max_length=100, blank=True, null=True)
    entrega_barrio = models.CharField(max_length=150, blank=True, null=True)
    metodo_pago = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f'Pedido #{self.pk} de {self.usuario.username}'


class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio_pagado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Precio unitario pagado (con descuento aplicado)')
    enviado = models.BooleanField(default=False, help_text='El vendedor marcó este producto como enviado')

    def __str__(self):
        return f'{self.producto.nombre} x {self.cantidad}'


class SolicitudServicio(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aceptado', 'Aceptado'),
        ('rechazado', 'Rechazado'),
        ('negociacion', 'Negociación'),  # Nuevo estado
    ]
    servicio = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='solicitudes_servicio')
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='solicitudes_realizadas')
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='solicitudes_recibidas')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    detalles = models.TextField(blank=True, null=True)
    fecha = models.DateField(null=True, blank=True)  # Fecha solicitada por el cliente
    hora = models.TimeField(null=True, blank=True)   # Hora solicitada por el cliente
    # Dirección donde se debe prestar el servicio (puede venir del perfil del cliente o ser especificada)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    barrio = models.CharField(max_length=150, blank=True, null=True)
    ciudad = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True, related_name='solicitudes')
    # Nuevos campos para negociación
    fecha_propuesta = models.DateField(null=True, blank=True)  # Fecha propuesta por el vendedor
    hora_propuesta = models.TimeField(null=True, blank=True)   # Hora propuesta por el vendedor
    ultima_propuesta_por = models.CharField(max_length=10, choices=[('cliente','Cliente'),('vendedor','Vendedor')], default='cliente')
    # Campo para guardar la calificación final del servicio (si el cliente la deja)
    calificacion_valor = models.PositiveSmallIntegerField(null=True, blank=True)
    calificacion_comentario = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Solicitud de {self.cliente.username} para {self.servicio.nombre} ({self.estado})"


class Calificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True, blank=True, related_name='calificaciones')
    solicitud_servicio = models.ForeignKey('SolicitudServicio', on_delete=models.CASCADE, null=True, blank=True, related_name='calificaciones')
    pedido_item = models.ForeignKey('PedidoItem', on_delete=models.CASCADE, null=True, blank=True, related_name='calificaciones')
    valor = models.PositiveSmallIntegerField()  # 1-5
    comentario = models.TextField(blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            ('usuario', 'pedido_item'),
            ('usuario', 'solicitud_servicio'),
        )

    def __str__(self):
        target = self.producto or self.solicitud_servicio or self.pedido_item
        return f'Calificacion {self.valor} por {self.usuario} sobre {target}'
