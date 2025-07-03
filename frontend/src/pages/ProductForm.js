import React, { useState } from 'react';
import axios from 'axios';

function ProductForm() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    if (imagen) formData.append('imagen', imagen);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:8000/api/productos/crear/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('Producto creado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al crear el producto');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Subir nuevo producto</h2>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
      <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
      <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
      <button type="submit">Crear producto</button>
    </form>
  );
}

export default ProductForm;
