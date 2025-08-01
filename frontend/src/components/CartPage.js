import React from "react";
import "./style/CartPage.css";

// Componente 1: Filtros generales
function CartFilters() {
  return (
    <div className="cart-filters">
      <label>
        <input type="checkbox" /> Todos los productos
      </label>
    </div>
  );
}

// Componente 2: Listado de productos
function CartProductGroup({ title, products }) {
  return (
    <div className="cart-product-group">
      <div className="cart-group-title">{title}</div>
      {products.map((prod, idx) => (
        <div className="cart-product" key={idx}>
          <img src={prod.img} alt={prod.name} className="cart-product-img" />
          <div className="cart-product-info">
            <div className="cart-product-name">{prod.name}</div>
            <div className="cart-product-actions">
              <button>-</button>
              <span>{prod.qty}</span>
              <button>+</button>
              <button className="cart-remove">Eliminar</button>
            </div>
          </div>
          <div className="cart-product-price">${prod.price.toLocaleString()}</div>
        </div>
      ))}
      <div className="cart-shipping">
        <span>Envío</span>
        <span className="cart-shipping-price">$12.300</span>
      </div>
    </div>
  );
}

// Componente 3: Resumen de compra
function CartSummary({ total, shipping }) {
  return (
    <div className="cart-summary">
      <h3>Resumen de compra</h3>
      <div className="cart-summary-row">
        <span>Producto</span>
        <span>${total.toLocaleString()}</span>
      </div>
      <div className="cart-summary-row">
        <span>Envío</span>
        <span>${shipping.toLocaleString()}</span>
      </div>
      <div className="cart-summary-total">
        <span>Total</span>
        <span>${(total + shipping).toLocaleString()}</span>
      </div>
      <button className="cart-summary-btn">Continuar compra</button>
    </div>
  );
}

// Página principal del carrito
const CartPage = () => {
  // Datos de ejemplo
  const products1 = [
    { name: "Camiseta Football Americano Willow 30 Bordó", img: "https://http2.mlstatic.com/D_NQ_NP_2X_602726-MLA54927442613_042023-F.webp", qty: 1, price: 55000 },
  ];
  const products2 = [
    { name: "Silla Ejecutiva Gerencial Magnux Ergonómica", img: "https://http2.mlstatic.com/D_NQ_NP_2X_602726-MLA54927442613_042023-F.webp", qty: 1, price: 139900 },
  ];
  const total = products1.reduce((a, p) => a + p.price * p.qty, 0) + products2.reduce((a, p) => a + p.price * p.qty, 0);
  const shipping = 12300;

  return (
    <div className="cart-page-container">
      <div className="cart-main">
        <CartFilters />
        <CartProductGroup title="Productos de CALAMS1" products={products1} />
        <CartProductGroup title="Productos FULL" products={products2} />
      </div>
      <div className="cart-side">
        <CartSummary total={total} shipping={shipping} />
      </div>
    </div>
  );
};

export default CartPage;
