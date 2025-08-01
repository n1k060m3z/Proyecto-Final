import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import '../style/ProductForm.css';

function ProductForm() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);
  const [stock, setStock] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [subcategorias, setSubcategorias] = useState([]);

  useEffect(() => {
    api.get('http://localhost:8000/api/categorias/')
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (categoriaId) {
      const cat = categorias.find(c => c.id === parseInt(categoriaId));
      setSubcategorias(cat && cat.subcategorias ? cat.subcategorias : []);
      setSubcategoriaId('');
    } else {
      setSubcategorias([]);
      setSubcategoriaId('');
    }
  }, [categoriaId, categorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    if (imagen) formData.append('imagen', imagen);
    if (categoriaId) formData.append('categoria_id', categoriaId);
    if (subcategoriaId) formData.append('subcategoria', subcategoriaId);
    if (stock) formData.append('stock', stock);

    try {
      const token = localStorage.getItem('token');
      const res = await api.post('http://127.0.0.1:8000/api/productos/crear/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('Producto creado correctamente');
      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setImagen(null);
      setCategoriaId('');
      setSubcategoriaId('');
      setStock('');
    } catch (error) {
      if (error.response) {
        alert('Error al crear el producto: ' + JSON.stringify(error.response.data));
      } else {
        alert('Error al crear el producto');
      }
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>Subir nuevo producto</h2>
      <label>Nombre</label>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
      <label>Descripción</label>
      <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
      <label>Precio</label>
      <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} required />
      <label>Categoría</label>
      <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
        <option value="">Selecciona una categoría</option>
        {categorias.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>
      {subcategorias.length > 0 ? (
        <>
          <label>Subcategoría</label>
          <select value={subcategoriaId} onChange={e => setSubcategoriaId(e.target.value)} required>
            <option value="">Selecciona una subcategoría</option>
            {subcategorias.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
        </>
      ) : null}
      <label>Stock</label>
      <input type="number" placeholder="Stock" value={stock} min={1} onChange={e => setStock(e.target.value)} required />
      <label>Imagen</label>
      <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />
      <button type="submit">Crear producto</button>
    </form>
  );
}

export default ProductForm;
