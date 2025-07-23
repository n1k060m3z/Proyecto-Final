from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Producto, Usuario, CarritoItem, Carrito, Pedido, PedidoItem

class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'es_vendedor', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('es_vendedor', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Rol', {'fields': ('es_vendedor', 'telefono')}),
    )

admin.site.register(Producto)
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(CarritoItem)
admin.site.register(Carrito)
admin.site.register(Pedido)
admin.site.register(PedidoItem)
