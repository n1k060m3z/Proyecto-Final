import React, { useEffect, useState } from "react";
import AddToCartButton from '../components/AddToCartButton';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useParams, useLocation, Link } from "react-router-dom";
import "../style/busqueda.css";
import CatBar from '../components/cat';

// El conteo de categorías será dinámico

const categoriaNombresPorDefecto = {
	1: "Tecnología",
	2: "Ropa",
	3: "Servicios",
	4: "Hogar y Oficina",
	5: "Deportes",
	6: "Libros",
	7: "Videojuegos",
	8: "Ofertas",
	// Agrega aquí los IDs y nombres de tus categorías principales
};

const Busqueda = () => {
	const { categoriaId, subcategoriaId } = useParams();
	const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  // Cargar productos en carrito para marcar los que ya están
  useEffect(() => {
	const token = localStorage.getItem('token');
	if (!token) return;
	fetch('http://localhost:8000/api/carrito/', {
	  headers: { Authorization: `Bearer ${token}` }
	})
	  .then(res => res.ok ? res.json() : [])
	  .then(data => setCarrito(Array.isArray(data) ? data : []))
	  .catch(() => setCarrito([]));
  }, []);

  const handleAddToCart = async (productoId) => {
	const token = localStorage.getItem('token');
	if (!token) {
	  toast.error('Debes iniciar sesión');
	  return;
	}
	try {
	  const res = await fetch('http://localhost:8000/api/carrito/', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
	  });
	  if (res.ok) {
		toast.success('Producto agregado al carrito');
		// Actualizar carrito local
		const nuevo = await res.json();
		setCarrito((prev) => [...prev, nuevo]);
	  } else {
		toast.error('No se pudo agregar al carrito');
	  }
	} catch {
	  toast.error('Error al conectar con el servidor');
	}
  };
	const [titulo, setTitulo] = useState("");
	const [orden, setOrden] = useState("relevantes");
	const [categoriasSidebar, setCategoriasSidebar] = useState([]);
const filtrosEjemplo = {
	ubicaciones: [
		{ nombre: "Bogotá D.C.", cantidad: 26 },
		{ nombre: "Antioquia", cantidad: 5 },
		{ nombre: "Risaralda", cantidad: 3 },
		{ nombre: "Tolima", cantidad: 3 },
		{ nombre: "Valle Del Cauca", cantidad: 3 },
		{ nombre: "Cundinamarca", cantidad: 2 },
		{ nombre: "Atlántico", cantidad: 1 },
		{ nombre: "Cauca", cantidad: 1 },
		{ nombre: "Quindio", cantidad: 1 },
	],
	tiendas: [{ nombre: "Solo tiendas oficiales", cantidad: 1 }],
};

	useEffect(() => {
		let url = "http://localhost:8000/api/productos/";
		const params = new URLSearchParams(location.search);
		const oferta = params.get('oferta');
		if (subcategoriaId) {
			url = `http://localhost:8000/api/productos/subcategoria/${subcategoriaId}/`;
		} else if (categoriaId && oferta === '1') {
			url = `http://localhost:8000/api/productos/ofertas/categoria/${categoriaId}/`;
		} else if (categoriaId === '8' || categoriaId === 8) {
			// Si la categoría es Ofertas, traer todos los productos y filtrar en_oferta en el frontend
			url = `http://localhost:8000/api/productos/`;
		} else if (categoriaId) {
			url = `http://localhost:8000/api/productos/categoria/${categoriaId}/`;
		}
		console.log('URL productos:', url, 'categoriaId:', categoriaId, 'subcategoriaId:', subcategoriaId);
		api
			.get(url)
			.then((res) => {
				let productosFiltrados = res.data;
				// Si la categoría es Ofertas, filtrar en_oferta en el frontend
				if (categoriaId === '8' || categoriaId === 8) {
					productosFiltrados = productosFiltrados.filter(p => p.en_oferta);
				}
				// Si hay búsqueda, filtrar solo por el query
				const q = params.get('q');
				if (q) {
					productosFiltrados = productosFiltrados.filter(p =>
						p.nombre && p.nombre.toLowerCase().includes(q.toLowerCase())
					);
				}
				// Normalizar la URL de imagen para asegurar que siempre sea absoluta
				productosFiltrados = productosFiltrados.map(p => {
					if (p.imagen && p.imagen.startsWith('/media/productos/')) {
						p.imagen = `http://localhost:8000${p.imagen}`;
					}
					return p;
				});
				setProductos(productosFiltrados);
			})
			.catch((err) => {
				setProductos([]);
			});
	}, [categoriaId, subcategoriaId, location.search]);

	useEffect(() => {
		// Obtener categorías y conteo de productos dinámicamente
		api.get("http://localhost:8000/api/categorias/")
			.then((res) => {
				const categorias = res.data;
				if (!Array.isArray(categorias)) {
					setCategoriasSidebar([]);
					return;
				}
				Promise.all(
					categorias.map(async (cat) => {
						let count = 0;
						try {
							const prodRes = await api.get(`http://localhost:8000/api/productos/categoria/${cat.id}/`);
							// Si la respuesta es un array, filtra los productos que realmente tienen la categoría
							if (Array.isArray(prodRes.data)) {
								count = prodRes.data.filter(p => {
									if (p.categoria && typeof p.categoria === 'object' && 'id' in p.categoria) {
										return p.categoria.id === cat.id;
									}
									return p.categoria === cat.id;
								}).length;
							} else {
								count = 0;
							}
						} catch {
							count = 0;
						}
						return { nombre: cat.nombre, cantidad: count };
					})
				).then((categoriasConConteo) => {
					setCategoriasSidebar(categoriasConConteo);
				});
			})
			.catch(() => setCategoriasSidebar([]));
	}, []);

	useEffect(() => {
		if (subcategoriaId && categoriaId === "5") {
			// Si es deportes y subcategoría, mostrar el nombre fijo
			const sub = [
				{ id: "51", nombre: "Fútbol" },
				{ id: "52", nombre: "Atletismo" },
				{ id: "53", nombre: "Ciclismo" },
				{ id: "54", nombre: "Otros" },
			].find(s => s.id === subcategoriaId);
			if (sub) {
				setTitulo(`Deportes - ${sub.nombre}`);
				return;
			}
		}
		if (subcategoriaId) {
			api
				.get(`http://localhost:8000/api/subcategorias/${subcategoriaId}/`)
				.then((res) => {
					const nombreSub = res.data.nombre;
					const categoriaIdFromSub = res.data.categoria || categoriaId;
					if (categoriaIdFromSub) {
						api
							.get(`http://localhost:8000/api/categorias/${categoriaIdFromSub}/`)
							.then((catRes) => {
								const nombreCategoria = catRes.data.nombre || categoriaNombresPorDefecto[categoriaIdFromSub] || "";
								if (["Tecnología", "Ropa", "Servicios", "Deportes"].includes(nombreCategoria)) {
									setTitulo(`${nombreCategoria} - ${nombreSub}`);
								} else {
									setTitulo(`${nombreCategoria} ${nombreSub}`);
								}
							})
							.catch(() => {
								setTitulo(nombreSub);
							});
					} else {
						setTitulo(nombreSub);
					}
				})
				.catch(() => {
					if (categoriaId) {
						api
							.get(`http://localhost:8000/api/categorias/${categoriaId}/`)
							.then((catRes) => setTitulo(catRes.data.nombre))
							.catch(() => {
								const nombrePorDefecto = categoriaNombresPorDefecto[categoriaId] || "";
								setTitulo(nombrePorDefecto);
							});
					} else {
						setTitulo("Hogar y Oficina");
					}
				});
		} else if (categoriaId) {
			api
				.get(`http://localhost:8000/api/categorias/${categoriaId}/`)
				.then((res) => setTitulo(res.data.nombre))
				.catch(() => {
					const nombrePorDefecto = categoriaNombresPorDefecto[categoriaId] || "";
					setTitulo(nombrePorDefecto);
				});
		} else {
			setTitulo("Hogar y Oficina");
		}
  }, [categoriaId, subcategoriaId]);

	const handleOrdenChange = (e) => {
		const value = e.target.value;
		setOrden(value);
		let productosOrdenados = [...productos];
		if (value === "precio_menor") {
			productosOrdenados.sort((a, b) => (a.precio || 0) - (b.precio || 0));
		} else if (value === "precio_mayor") {
			productosOrdenados.sort((a, b) => (b.precio || 0) - (a.precio || 0));
		}
		setProductos(productosOrdenados);
	};

const handleCategoriaClick = (cat, idx) => {
	window.location.href = `/buscar/${idx + 1}`;
};

// Si la búsqueda es global, mostrar solo el resultado exacto y no el sidebar de categorías ni filtros
const params = new URLSearchParams(location.search);
const q = params.get('q');

	return (
		<div className="container">
			<CatBar />
			<div className="busqueda-container">
				<aside className="busqueda-sidebar">
					<h2>{titulo}</h2>
					<div className="resultados">{productos.length} resultados</div>
					<div className="filtro-titulo">Categorías</div>
					{categoriasSidebar.map((cat, idx) => (
						<button key={cat.nombre} className="filtro-link" onClick={() => handleCategoriaClick(cat, idx)}>
							{cat.nombre} <span style={{ color: "#888" }}>({cat.cantidad})</span>
						</button>
					))}
					<div className="filtro-titulo">Ubicación</div>
					{/* Puedes dejar ubicaciones y tiendas como estaban, o hacerlos dinámicos si lo necesitas */}
					{filtrosEjemplo.ubicaciones.map((ubi) => (
						<button key={ubi.nombre} className="filtro-link">
							{ubi.nombre} <span style={{ color: "#888" }}>({ubi.cantidad})</span>
						</button>
					))}
					<div className="filtro-titulo">Tiendas oficiales</div>
					{filtrosEjemplo.tiendas.map((tienda) => (
						<button key={tienda.nombre} className="filtro-link">
							{tienda.nombre} <span style={{ color: "#888" }}>({tienda.cantidad})</span>
						</button>
					))}
				</aside>
				<main className="busqueda-main">
					<div className="ordenar-bar">
						<span style={{ color: "#888", fontSize: 15, marginRight: 8 }}>
							Ordenar por
						</span>
						<select
							value={orden}
							onChange={handleOrdenChange}
							style={{
								fontSize: 15,
								padding: "4px 8px",
								borderRadius: 4,
								border: "1px solid #ccc",
							}}
						>
							<option value="relevantes">Más relevantes</option>
							<option value="precio_menor">Menor precio</option>
							<option value="precio_mayor">Mayor precio</option>
						</select>
					</div>
  {productos.length === 0 ? (
			<div style={{textAlign: 'center', color: '#888', fontSize: 20, marginTop: 40}}>
			  Esta categoria no tiene por el momento productos en oferta
			</div>
		  ) : (
	productos.map((producto) => {
	  const enCarrito = carrito.some((item) => item.producto && (item.producto.id === producto.id || item.producto === producto.id));
	  return (
		<div key={producto.id} className="producto-link-wrapper" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
		  <Link
			to={`/producto/${producto.id}`}
			style={{ flex: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
		  >
			<div className="producto-card" style={{ width: '100%' }}>
			  <img
				src={producto.imagen}
				alt={producto.nombre}
				className="producto-img"
			  />
			  <div className="producto-info">
				<div className="producto-nombre">{producto.nombre}</div>
				<div className="producto-precio">
				  {producto.en_oferta && producto.descuento > 0 ? (
					<>
					  <span style={{ color: '#e53935', fontWeight: 700 }}>
						$ {Math.floor(producto.precio_con_descuento).toLocaleString()}
					  </span>
					  <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: 8 }}>
						$ {Math.floor(producto.precio).toLocaleString()}
					  </span>
					  <span style={{ color: '#388e3c', marginLeft: 8 }}>
						-{producto.descuento}%
					  </span>
					</>
				  ) : (
					producto.precio
					  ? `$ ${Math.floor(producto.precio).toLocaleString()}`
					  : "Precio a convenir"
				  )}
				</div>
				<div className="producto-ciudad">
				  {producto.ciudad || ""}
				</div>
			  </div>
			</div>
		  </Link>
		  <div style={{ marginLeft: 16 }}>
			<AddToCartButton
			  onClick={() => handleAddToCart(producto.id)}
			  added={enCarrito}
			  disabled={enCarrito}
			/>
		  </div>
		</div>
	  );
	})
		  )}
				</main>
			</div>
		</div>
	);
};

export default Busqueda;
