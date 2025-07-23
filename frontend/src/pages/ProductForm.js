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
      console.log('Token usado para crear producto:', token); // LOG DE DEPURACIÓN
      const res = await axios.post('http://127.0.0.1:8000/api/productos/crear/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Status de respuesta crear producto:', res.status); // LOG NUEVO
      console.log('Datos de respuesta crear producto:', res.data); // LOG NUEVO
      alert('Producto creado correctamente');
    } catch (error) {
      if (error.response) {
        console.error('Status error crear producto:', error.response.status); // LOG NUEVO
        console.error('Datos error crear producto:', error.response.data); // LOG NUEVO
        alert('Error al crear el producto: ' + JSON.stringify(error.response.data));
      } else {
        console.error(error);
        alert('Error al crear el producto');
      }
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
