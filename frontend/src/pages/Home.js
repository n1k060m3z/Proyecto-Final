import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import CatBar from '../components/cat';

function Home() {
  const navigate = useNavigate();
  // Accesos directos como en cap1
  const categoriasAcceso = [
    {
      nombre: 'Computadores',
      img: 'https://s3.us-east-2.amazonaws.com/ccp-prd-s3-uploads/2020/11/19/7de281da13617a205d09085b254c90f78f03d5fb.webp',
      ruta: '/buscar/1/2',
    },
    {
      nombre: 'Celulares',
      img: 'https://tienda.movistar.com.co/media/catalog/product/cache/7b67d11b0e636dc619c10a9a93dbc27e/s/a/samsung_a16_green_1.jpg',
      ruta: '/buscar/1/1',
    },
    {
      nombre: 'Videojuegos',
      img: 'https://fd.ort.edu.uy/innovaportal/file/154809/1/ps5-xbox-nintendo-consolas-nuevas-historia-de-videojuegos-universidad-ort-uruguay.jpg',
      ruta: '/buscar/7',
    },
    {
      nombre: 'Reparaciones',
      img: 'https://accolombianlawyers.com/noticias/wp-content/uploads/2021/01/reparaciones.jpg',
      ruta: '/buscar/3/6',
    },
    {
      nombre: 'Ofertas',
      img: 'https://img.freepik.com/psd-premium/super-ofertas-luz_983283-1310.jpg?semt=ais_hybrid&w=740',
      ruta: '/buscar/8',
    },
  ];

  // Ofertas por categoría: Tecnología, Ropa, Servicios, Hogar, Deportes, Libros, Videojuegos
  const ofertasCategorias = [
    {
      nombre: 'Tecnología',
      img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      ruta: '/buscar/tecnologia',
    },
    {
      nombre: 'Ropa',
      img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
      ruta: '/buscar/ropa',
    },
    {
      nombre: 'Servicios',
      img: 'https://www.albaniles.org/wp-content/uploads/2016/08/plomero1.jpg',
      ruta: '/buscar/servicios',
    },
    {
      nombre: 'Hogar',
      img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
      ruta: '/buscar/hogar',
    },
    {
      nombre: 'Deportes',
      img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
      ruta: '/buscar/deportes',
    },
    {
      nombre: 'Libros',
      img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      ruta: '/buscar/libros',
    },
    {
      nombre: 'Videojuegos',
      img: 'https://fd.ort.edu.uy/innovaportal/file/154809/1/ps5-xbox-nintendo-consolas-nuevas-historia-de-videojuegos-universidad-ort-uruguay.jpg',
      ruta: '/buscar/videojuegos',
    },
  ];

  return (
    <div className="container" style={{ background: '#f7f9fa', minHeight: '100vh', paddingBottom: 32 }}>
      {/* Barra de categorías ajustada al texto */}
      <div className="categorias-bar categorias-bar-ajustada categorias-bar-mas-estrecha">
        <CatBar />
      </div>

      <h2 className="accesos-directos-titulo">Accesos directos</h2>
      <div className="accesos-directos-lista">
        {categoriasAcceso.map(cat => (
          <div
            key={cat.nombre}
            className="acceso-card"
            onClick={() => navigate(cat.ruta)}
          >
            <img
              src={cat.img}
              alt={cat.nombre}
            />
            <span>{cat.nombre}</span>
          </div>
        ))}
      </div>

      {/* Sección Ofertas por categoría actualizada */}
      <h2 className="ofertas-titulo">Ofertas por categoría</h2>
      <div className="ofertas-categorias-lista">
        {ofertasCategorias.map(cat => (
          <div
            key={cat.nombre}
            className="oferta-cat-card"
            onClick={() => navigate(cat.ruta)}
          >
            <img src={cat.img} alt={cat.nombre} />
            <span>{cat.nombre}</span>
          </div>
        ))}
      </div>
      {/* El Footer ahora se muestra globalmente en App.js */}
    </div>
  );
}

export default Home;
