#!/usr/bin/env python3

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from shop.models import Pedido
from shop.serializers import PedidoSerializer

# Verificar pedidos
pedidos = Pedido.objects.all()[:3]
print(f"Total de pedidos: {Pedido.objects.count()}")

for pedido in pedidos:
    print(f"\n=== Pedido ID: {pedido.id} ===")
    print(f"Total: {pedido.total}")
    print(f"Shipping cost: {getattr(pedido, 'shipping_cost', 'Campo no existe')}")
    
    # Verificar serializer
    serializer = PedidoSerializer(pedido)
    data = serializer.data
    print(f"Shipping cost en serializer: {data.get('shipping_cost', 'No incluido')}")
    print(f"Campos disponibles: {list(data.keys())}")
