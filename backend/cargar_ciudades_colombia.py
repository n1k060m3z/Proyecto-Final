from shop.models import City

ciudades = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta',
    'Ibagué', 'Villavicencio', 'Manizales', 'Neiva', 'Pasto', 'Armenia', 'Montería', 'Sincelejo', 'Popayán',
    'Valledupar', 'Tunja', 'Riohacha', 'Quibdó', 'Florencia', 'Yopal', 'Mocoa', 'San José del Guaviare',
    'Puerto Carreño', 'Leticia', 'Mitú', 'Inírida', 'San Andrés', 'Turbo', 'Soledad', 'Itagüí', 'Envigado',
    'Palmira', 'Tuluá', 'Buenaventura', 'Dosquebradas', 'Floridablanca', 'Girón', 'Malambo', 'Magangué',
    'Sogamoso', 'Facatativá', 'Chía', 'Zipaquirá', 'Fusagasugá', 'Rionegro', 'Jamundí', 'Cajicá', 'Ciénaga',
    'Ipiales', 'Buga', 'Cartago', 'Tuluá', 'Apartadó', 'Piedecuesta', 'Chigorodó', 'Madrid', 'Mosquera',
    'La Dorada', 'Pitalito', 'Maicao', 'Ocaña', 'Sabanalarga', 'Lorica', 'Cereté', 'El Banco', 'Aguachica',
    'Caldas', 'Copacabana', 'Funza', 'Girardot', 'Sabaneta', 'Yumbo', 'Florida', 'Candelaria', 'La Estrella',
    'Riosucio', 'Sopó', 'Tocancipá', 'Villa del Rosario', 'Guarne', 'Cota', 'Sibaté', 'Turbaco', 'Arjona',
    'El Carmen de Bolívar', 'Montelíbano', 'Planeta Rica', 'Tierralta', 'San Marcos', 'San Onofre', 'Tolú',
    'Chinú', 'Sahagún', 'Ayapel', 'Caucasia', 'El Bagre', 'Nechí', 'Zaragoza', 'Segovia', 'Remedios',
    'Santa Rosa del Sur', 'Simití', 'San Pablo', 'Arenal', 'Morales', 'Tiquisio', 'Norosí', 'Regidor',
    'Río Viejo', 'Altos del Rosario', 'Barranco de Loba', 'Hatillo de Loba', 'San Martín de Loba',
    'Mompox', 'Tenerife', 'Plato', 'Pivijay', 'El Piñón', 'Salamina', 'Concordia', 'Zapayán', 'Pedraza',
    'Chibolo', 'Nueva Granada', 'Aracataca', 'Fundación', 'El Retén', 'Zona Bananera', 'Ciénaga de Oro',
    'San Pelayo', 'San Carlos', 'Puerto Libertador', 'Valencia', 'Canalete', 'Los Córdobas', 'Moñitos',
    'San Bernardo del Viento', 'Purísima', 'Momil', 'Tuchín', 'Chimá', 'San Andrés de Sotavento',
    'Buenavista', 'La Apartada', 'Montelíbano', 'Puerto Escondido', 'San Antero', 'San José de Uré',
    'Cotorra', 'Pueblo Nuevo', 'Chinú', 'Sahagún', 'Ayapel', 'Caucasia', 'El Bagre', 'Nechí', 'Zaragoza',
    'Segovia', 'Remedios', 'Santa Rosa del Sur', 'Simití', 'San Pablo', 'Arenal', 'Morales', 'Tiquisio',
    'Norosí', 'Regidor', 'Río Viejo', 'Altos del Rosario', 'Barranco de Loba', 'Hatillo de Loba',
    'San Martín de Loba', 'Mompox', 'Tenerife', 'Plato', 'Pivijay', 'El Piñón', 'Salamina', 'Concordia',
    'Zapayán', 'Pedraza', 'Chibolo', 'Nueva Granada', 'Aracataca', 'Fundación', 'El Retén', 'Zona Bananera'
]

for nombre in set(ciudades):
    City.objects.get_or_create(name=nombre, country='CO')
print('Ciudades de Colombia cargadas.')
