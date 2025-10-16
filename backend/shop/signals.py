from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Usuario, Producto

@receiver(post_save, sender=Usuario)
def actualizar_ciudad_productos(sender, instance, created, **kwargs):
    if not created:
        # Actualizar la ciudad de todos los productos del usuario
        Producto.objects.filter(vendedor=instance).update(ciudad=instance.city)
