from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Producto, Usuario, CarritoItem, Carrito, Pedido, PedidoItem

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'subcategoria', 'precio', 'vendedor')
    list_filter = ('categoria', 'subcategoria')
    search_fields = ('nombre', 'descripcion')

admin.site.register(Producto, ProductoAdmin)
admin.site.register(Usuario, UserAdmin)
admin.site.register(CarritoItem)
admin.site.register(Carrito)
admin.site.register(Pedido)
admin.site.register(PedidoItem)
