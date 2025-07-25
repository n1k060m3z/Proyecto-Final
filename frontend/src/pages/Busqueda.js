import React, { useEffect, useState } from "react";
import api from '../api/axios';
import { useParams, useLocation } from "react-router-dom";
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
	// Agrega aquí los IDs y nombres de tus categorías principales
};

const Busqueda = () => {
	const { categoriaId, subcategoriaId } = useParams();
	const location = useLocation();
	const [productos, setProductos] = useState([]);
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
		api
			.get(url)
			.then((res) => {
				let productosFiltrados = res.data;
				// Si hay búsqueda, filtrar solo por el query
				const params = new URLSearchParams(location.search);
				const q = params.get('q');
				if (q) {
					productosFiltrados = productosFiltrados.filter(p =>
						p.nombre && p.nombre.toLowerCase().includes(q.toLowerCase())
					);
				} else {
					// Si no hay búsqueda, filtrar por categoría/subcategoría
					if (subcategoriaId) {
						productosFiltrados = productosFiltrados.filter(p => {
							if (p.subcategoria && typeof p.subcategoria === 'object' && 'id' in p.subcategoria) {
								return p.subcategoria.id == subcategoriaId;
							}
							return p.subcategoria == subcategoriaId;
						});
					} else if (categoriaId) {
						productosFiltrados = productosFiltrados.filter(p => {
							if (p.categoria && typeof p.categoria === 'object' && 'id' in p.categoria) {
								return p.categoria.id == categoriaId;
							}
							return p.categoria == categoriaId;
						});
					}
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
			.catch(() => setProductos([]));
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
								if (["Tecnología", "Ropa", "Servicios"].includes(nombreCategoria)) {
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
					{productos.map((producto) => (
						<div key={producto.id} className="producto-card">
							<img
								src={producto.imagen}
								alt={producto.nombre}
								className="producto-img"
							/>
							<div className="producto-info">
								<div className="producto-nombre">{producto.nombre}</div>
								<div className="producto-precio">
									{producto.precio
										? `$ ${Math.floor(producto.precio).toLocaleString()}`
										: "Precio a convenir"}
								</div>
								<div className="producto-ciudad">
									{producto.ciudad || ""}
								</div>
							</div>
						</div>
					))}
				</main>
			</div>
		</div>
	);
};

export default Busqueda;
