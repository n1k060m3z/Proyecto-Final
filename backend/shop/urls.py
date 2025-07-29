from django.urls import path

from .views import (
    ProductoListView,
    ProductoCreateView,
    RegistroUsuarioView,
    CustomTokenObtainPairView,
    CarritoListCreateView,
    CarritoDeleteView,
    PedidoCreateView,
    ProductosPorCategoriaView,
    ProductosPorSubcategoriaView,  # <-- nueva vista
    CategoriaListView,
    SubcategoriaDetailView,
    CategoriaDetailView,
    CambiarRolUsuarioView,
    PerfilUsuarioView,
    VerificarPasswordView,
    MisPublicacionesView,
    ProductoRetrieveUpdateView,  # <--- agregar
    ProductosEnOfertaPorCategoriaView,  # <-- nueva vista para ofertas
)

urlpatterns = [
    # Productos
    path('productos/', ProductoListView.as_view(), name='listar_productos'),
    path('productos/crear/', ProductoCreateView.as_view(), name='crear_producto'),
    path('productos/categoria/<int:categoria_id>/', ProductosPorCategoriaView.as_view(), name='productos_por_categoria'),
    path('productos/subcategoria/<int:subcategoria_id>/', ProductosPorSubcategoriaView.as_view(), name='productos_por_subcategoria'),  # <-- nuevo endpoint
    path('productos/<int:pk>/', ProductoRetrieveUpdateView.as_view(), name='detalle_producto'),  # <--- agregar
    path('productos/ofertas/categoria/<int:categoria_id>/', ProductosEnOfertaPorCategoriaView.as_view(), name='productos_en_oferta_por_categoria'),  # <-- nuevo endpoint

    # Autenticación y registro
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro_usuario'),

    # Carrito
    path('carrito/', CarritoListCreateView.as_view(), name='carrito-list-create'),
    path('carrito/<int:id>/', CarritoDeleteView.as_view(), name='carrito-delete'),

    # Pedidos
    path('pedido/', PedidoCreateView.as_view(), name='crear-pedido'),


    # Categorías
    path('categorias/', CategoriaListView.as_view(), name='listar_categorias'),
    path('categorias/<int:pk>/', CategoriaDetailView.as_view(), name='detalle_categoria'),
    path('subcategorias/<int:pk>/', SubcategoriaDetailView.as_view(), name='detalle_subcategoria'),

    # Cambiar rol de usuario
    path('usuario/cambiar-rol/', CambiarRolUsuarioView.as_view(), name='cambiar_rol_usuario'),

    # Perfil de usuario
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('perfil/verificar-password/', VerificarPasswordView.as_view(), name='verificar_password'),

    # Publicaciones del vendedor
    path('mis-publicaciones/', MisPublicacionesView.as_view(), name='mis_publicaciones'),
]
