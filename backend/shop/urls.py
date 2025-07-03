from django.urls import path
from .views import (
    ProductoListView,
    ProductoCreateView,
    RegistroUsuarioView,
    CustomTokenObtainPairView,
    CarritoListCreateView,
    CarritoDeleteView,
    PedidoCreateView
)

urlpatterns = [
    # Productos
    path('productos/', ProductoListView.as_view(), name='listar_productos'),
    path('productos/crear/', ProductoCreateView.as_view(), name='crear_producto'),

    # Autenticación y registro
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro_usuario'),

    # Carrito
    path('carrito/', CarritoListCreateView.as_view(), name='carrito-list-create'),
    path('carrito/<int:id>/', CarritoDeleteView.as_view(), name='carrito-delete'),

    # Pedidos
    path('pedido/', PedidoCreateView.as_view(), name='crear-pedido'),
]
