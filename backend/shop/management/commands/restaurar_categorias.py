from django.core.management.base import BaseCommand
from shop.models import Producto, Categoria
from django.db.models import Q

class Command(BaseCommand):
    help = 'Restaura la categoría original de los productos que están en Ofertas o con categoria=null, usando categoria_anterior si existe.'

    def handle(self, *args, **options):
        # Buscar la categoría "Ofertas" (ajusta el nombre si es diferente)
        categoria_ofertas = Categoria.objects.filter(nombre__iexact='Ofertas').first()
        if not categoria_ofertas:
            self.stdout.write(self.style.ERROR('No existe la categoría "Ofertas".'))
            return

        productos_actualizados = 0
        productos = Producto.objects.filter(
            Q(categoria=categoria_ofertas) | Q(categoria__isnull=True)
        )
        for producto in productos:
            if producto.categoria_anterior:
                producto.categoria = producto.categoria_anterior
                producto.categoria_anterior = None
                producto.save()
                productos_actualizados += 1
        self.stdout.write(self.style.SUCCESS(f'Se restauraron {productos_actualizados} productos a su categoría original.'))