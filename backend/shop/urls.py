from django.urls import path

from .views import (
    ProductoListView,
    ProductoCreateView,
    RegistroUsuarioView,
    CustomTokenObtainPairView,
    CarritoListCreateView,
    CarritoUpdateDeleteView,
    PedidoCreateView,
    PedidoListView,  # <-- nuevo import para listar pedidos
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
    GetUserEmailView,
    PasswordResetRequestView,
    ProductosPorVendedorView,  # <-- nuevo import
    UsuarioPublicoView,  # <-- nuevo import para el perfil público de usuario
    CityListView,  # <-- nuevo import para listar ciudades
    MarcarPedidoItemEnviadoView,  # <-- nuevo import para marcar pedido item como enviado
    PedidoClienteListView,  # <-- nuevo import para listar pedidos del comprador
    CalificacionView,  # <-- nuevo import para crear calificaciones
    CalificacionListView,  # <-- nuevo import para listar calificaciones
    VendedorRatingView,  # <-- nuevo import para el rating del vendedor
)
from .views_solicitud_servicio import SolicitudServicioListCreateView, SolicitudServicioUpdateView

urlpatterns = [
    # Productos
    path('productos/', ProductoListView.as_view(), name='listar_productos'),
    path('productos/crear/', ProductoCreateView.as_view(), name='crear_producto'),
    path('productos/categoria/<int:categoria_id>/', ProductosPorCategoriaView.as_view(), name='productos_por_categoria'),
    path('productos/subcategoria/<int:subcategoria_id>/', ProductosPorSubcategoriaView.as_view(), name='productos_por_subcategoria'),  # <-- nuevo endpoint
    path('productos/<int:pk>/', ProductoRetrieveUpdateView.as_view(), name='detalle_producto'),  # <--- agregar
    path('productos/ofertas/categoria/<int:categoria_id>/', ProductosEnOfertaPorCategoriaView.as_view(), name='productos_en_oferta_por_categoria'),  # <-- nuevo endpoint
    path('productos/vendedor/<int:vendedor_id>/', ProductosPorVendedorView.as_view(), name='productos_por_vendedor'),  # <-- nuevo endpoint

    # Recuperación de contraseña y consulta de correo
    path('get-user-email/', GetUserEmailView.as_view(), name='get_user_email'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),

    # Autenticación y registro
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro_usuario'),

    # Carrito
    path('carrito/', CarritoListCreateView.as_view(), name='carrito-list-create'),
    path('carrito/<int:id>/', CarritoUpdateDeleteView.as_view(), name='carrito-update-delete'),

    # Pedidos
    path('pedido/', PedidoCreateView.as_view(), name='crear-pedido'),
    path('pedido/list/', PedidoListView.as_view(), name='pedido-list'),  # <-- ahora GET para listar pedidos
    path('pedido/cliente/', PedidoClienteListView.as_view(), name='pedido-cliente'),  # Pedido del comprador

    # Marcar producto como enviado
    path('pedido-item/<int:item_id>/enviar/', MarcarPedidoItemEnviadoView.as_view(), name='marcar_pedidoitem_enviado'),

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

    # Solicitudes de servicios
    path('solicitudes-servicio/', SolicitudServicioListCreateView.as_view(), name='solicitudes_servicio'),
    path('solicitudes-servicio/<int:pk>/', SolicitudServicioUpdateView.as_view(), name='solicitud_servicio_update'),

    # Perfil público de usuario
    path('usuarios/publico/<int:usuario_id>/', UsuarioPublicoView.as_view(), name='usuario_publico'),
    # Rating del vendedor
    path('usuarios/<int:vendedor_id>/rating/', VendedorRatingView.as_view(), name='vendedor_rating'),
    # Ciudades
    path('ciudades/', CityListView.as_view(), name='listar_ciudades'),

    # Calificaciones
    path('calificaciones/', CalificacionView.as_view(), name='calificacion-crear'),
    path('calificaciones/mis/', CalificacionListView.as_view(), name='calificacion-list'),
]
