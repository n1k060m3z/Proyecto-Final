import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import CatBar from '../components/cat';

function Home() {
  const navigate = useNavigate();
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

  return (
    <div className="container">
      <CatBar />
      <h2 style={{ marginTop: 24, marginBottom: 12 }}>Accesos directos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
        {categoriasAcceso.map(cat => (
          <div
            key={cat.nombre}
            style={{ width: 200, height: 200, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2.5px solid #2563eb', transition: 'box-shadow 0.2s', fontSize: 18 }}
            onClick={() => navigate(cat.ruta)}
          >
            <img
              src={cat.img}
              alt={cat.nombre}
              style={{ width: 110, height: 110, objectFit: 'contain', marginBottom: 12 }}
            />
            <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 20 }}>{cat.nombre}</span>
          </div>
        ))}
      </div>
      {/* El Footer ahora se muestra globalmente en App.js */}
    </div>
  );
}

export default Home;
