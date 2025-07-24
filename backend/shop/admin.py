
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Categoria
admin.site.register(Categoria)
from .models import Producto, Usuario, CarritoItem, Carrito, Pedido, PedidoItem

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'subcategoria', 'precio', 'vendedor')
    list_filter = ('categoria', 'subcategoria')
    search_fields = ('nombre', 'descripcion')

class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'es_vendedor', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('es_vendedor', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Rol', {'fields': ('es_vendedor', 'telefono')}),
    )

admin.site.register(Producto, ProductoAdmin)
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(CarritoItem)
admin.site.register(Carrito)
admin.site.register(Pedido)
admin.site.register(PedidoItem)
