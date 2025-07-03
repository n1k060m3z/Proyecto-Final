from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Producto, Usuario, CarritoItem, Carrito, Pedido, PedidoItem  # Usamos el modelo correcto

admin.site.register(Producto)
admin.site.register(Usuario, UserAdmin)  # Ahora sí: modelo primero, admin segundo
admin.site.register(CarritoItem)
admin.site.register(Carrito)
admin.site.register(Pedido)
admin.site.register(PedidoItem)
