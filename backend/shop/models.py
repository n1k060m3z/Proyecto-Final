from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    es_vendedor = models.BooleanField(default=False)
    telefono = models.CharField(max_length=20, blank=True, null=True)

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

    def __str__(self):
        return f'Pedido #{self.pk} de {self.usuario.username}'


class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.producto.nombre} x {self.cantidad}'
