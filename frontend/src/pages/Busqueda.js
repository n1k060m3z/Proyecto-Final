import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../style/busqueda.css";

const filtrosEjemplo = {
	categorias: [
		{ nombre: "Electrodomésticos", cantidad: 6 },
		{ nombre: "Fotocopiadoras", cantidad: 1 },
		{ nombre: "Otros", cantidad: 38 },
	],
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

const Busqueda = () => {
	const { categoriaId, subcategoriaId } = useParams();
	const [productos, setProductos] = useState([]);
	const [titulo, setTitulo] = useState("Hogar y Oficina");
	const [orden, setOrden] = useState("relevantes");

	useEffect(() => {
		let url = "http://localhost:8000/api/productos/";
		if (subcategoriaId) {
			url = `http://localhost:8000/api/productos/subcategoria/${subcategoriaId}/`;
		} else if (categoriaId) {
			url = `http://localhost:8000/api/productos/categoria/${categoriaId}/`;
		}
		axios
			.get(url)
			.then((res) => setProductos(res.data))
			.catch(() => setProductos([]));
	}, [categoriaId, subcategoriaId]);

	const handleOrdenChange = (e) => {
		setOrden(e.target.value);
		// Aquí podrías ordenar los productos según la opción seleccionada
	};

	return (
		<div className="busqueda-container">
			<aside className="busqueda-sidebar">
				<h2>Hogar y Oficina</h2>
				<div className="resultados">{productos.length} resultados</div>
				<div className="filtro-titulo">Categorías</div>
				{filtrosEjemplo.categorias.map((cat) => (
					<button key={cat.nombre} className="filtro-link">
						{cat.nombre}{" "}
						<span style={{ color: "#888" }}>({cat.cantidad})</span>
					</button>
				))}
				<div className="filtro-titulo">Ubicación</div>
				{filtrosEjemplo.ubicaciones.map((ubi) => (
					<button key={ubi.nombre} className="filtro-link">
						{ubi.nombre}{" "}
						<span style={{ color: "#888" }}>({ubi.cantidad})</span>
					</button>
				))}
				<div className="filtro-titulo">Tiendas oficiales</div>
				{filtrosEjemplo.tiendas.map((tienda) => (
					<button key={tienda.nombre} className="filtro-link">
						{tienda.nombre}{" "}
						<span style={{ color: "#888" }}>({tienda.cantidad})</span>
					</button>
				))}
			</aside>
			<main className="busqueda-main">
				<div className="ordenar-bar">
					<span
						style={{ color: "#888", fontSize: 15, marginRight: 8 }}
					>
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
									? `$ ${producto.precio.toLocaleString()}`
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
	);
};

export default Busqueda;
