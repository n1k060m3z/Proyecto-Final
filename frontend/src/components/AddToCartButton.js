import React from "react";
import "./style/AddToCartButton.css";

const AddToCartButton = ({ onClick, added, disabled }) => {
  return (
    <button
      className={`add-to-cart-btn${added ? " added" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={added ? "Ya en el carrito" : "Agregar al carrito"}
    >
      {added ? "En carrito" : "Carrito"}
    </button>
  );
};

export default AddToCartButton;
