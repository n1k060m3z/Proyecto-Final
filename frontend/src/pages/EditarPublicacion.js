import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Volver from '../components/Volver';
import CajaDesplegable from '../components/CajaDesplegable';
import '../style/EditarPublicacion.css';

const EditarPublicacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [form, setForm] = useState({
    precio: '',
    titulo: '',
    descripcion: '',
    fotos: [],
    exposicion: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [nuevaImagen, setNuevaImagen] = useState(null);

  useEffect(() => {
    api.get(`productos/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setProducto(res.data);
        setForm({
          precio: res.data.precio || '',
          titulo: res.data.nombre || '',
          descripcion: res.data.descripcion || '',
          fotos: res.data.fotos || [],
          exposicion: res.data.exposicion || '',
        });
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    const formData = new FormData();
    formData.append('nombre', form.titulo);
    formData.append('descripcion', form.descripcion);
    formData.append('precio', form.precio);
    formData.append('exposicion', form.exposicion);
    if (nuevaImagen) {
      formData.append('imagen', nuevaImagen);
    }
    await api.patch(`productos/${id}/`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    setGuardando(false);
    navigate('/publicaciones');
  };

  if (!producto) return <div className="editar-publicacion-loading">Cargando...</div>;

  return (
    <div className="editar-publicacion-container">
      <Volver to="/publicaciones" />
      <h2 className="editar-publicacion-titulo">{form.titulo}</h2>
      <div className="editar-publicacion-cajas">
        <CajaDesplegable titulo="Precio (Opcional)">
          <div className="editar-publicacion-precio">
            <div className="editar-publicacion-precio-inputs">
              <span className="editar-publicacion-moneda">$</span>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio"
              />
            </div>
            <div className="editar-publicacion-info">
              <span className="info-title">Puedes acordar el precio</span>
              <span className="info-desc">Si tu servicio no tiene un precio fijo, puedes acordarlo con la persona interesada luego de que te contacte y cobrar lo que corresponda.</span>
            </div>
          </div>
        </CajaDesplegable>
        <CajaDesplegable titulo="Fotos">
          <div className="editar-publicacion-fotos">
            <div className="editar-publicacion-fotos-list">
              <label className="foto-agregar" htmlFor="input-imagen">Agregar
                <input
                  id="input-imagen"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setNuevaImagen(e.target.files[0])}
                />
              </label>
              {(nuevaImagen || (form.fotos && form.fotos.length > 0)) && (
                <div className="foto-portada">
                  <img src={nuevaImagen ? URL.createObjectURL(nuevaImagen) : form.fotos[0]} alt="Portada" />
                  <span>PORTADA</span>
                </div>
              )}
            </div>
          </div>
        </CajaDesplegable>
        <CajaDesplegable titulo="Agrega un título y una descripción">
          <div className="editar-publicacion-section-body">
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              maxLength={60}
              placeholder="Título (obligatorio)"
              className="editar-publicacion-input-titulo"
            />
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
              className="editar-publicacion-input-desc"
            />
          </div>
        </CajaDesplegable>
      </div>
      <div className="editar-publicacion-acciones">
        <button className="btn-cancelar" onClick={() => navigate('/publicaciones')}>Cancelar</button>
        <button className="btn-confirmar" onClick={handleGuardar} disabled={guardando}>Confirmar</button>
      </div>
    </div>
  );
};

export default EditarPublicacion;
