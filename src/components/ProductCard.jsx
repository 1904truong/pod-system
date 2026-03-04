import React, { useState } from "react";
import "../styles/ProductCard.css"; /* CSS riêng cho ProductCard */

const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const colors = product.colors || [
    { hex: "#ffc0cb" },
    { hex: "#800000" },
    { hex: "#ff7f50" },
    { hex: "#ff8c00" },
    { hex: "#e4d5b7" },
    { hex: "#9dc183" },
    { hex: "#87ceeb" },
    { hex: "#b22222" },
    { hex: "#fffdd0" },
    { hex: "#ba7f8c" },
    { hex: "#708090" },
    { hex: "#4169e1" },
    { hex: "#36454f" },
    { hex: "#000080" },
    { hex: "#228b22" },
    { hex: "#ffffff" },
    { hex: "#000000" },
    { hex: "#808080" },
    { hex: "#795548" },
    { hex: "#9b4caf" },
  ];

  // Màu đang được chọn – mặc định là màu đầu tiên
  const [selectedColor, setSelectedColor] = useState(
    colors[0]?.hex || "#ffffff"
  );

  // Hiển thị tối đa 6 chấm, phần còn lại hiện "+N"
  const MAX_DOTS = 6;
  const visibleColors = colors.slice(0, MAX_DOTS);
  const extraCount = colors.length - MAX_DOTS;

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const isWhite = (hex) => hex === "#ffffff" || hex === "#fff";

  return (
    /* ── CARD WRAPPER ── */
    <div className="product-card">
      {/* ── ẢNH SẢN PHẨM ── */}
      <div className="product-image">
        <img src={`/assets/${product.image}`} alt={product.name} />

        {/* Icon tim yêu thích */}
        <div
          className={`card-icon ${isLiked ? "active" : ""}`}
          onClick={handleHeartClick}
        >
          <i
            className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
          ></i>
        </div>
      </div>

      {/* ── THÔNG TIN SẢN PHẨM ── */}
      <div className="product-info">
        {/* ── CHẤM MÀU CÓ HIỆU ỨNG CHỌN ── */}
        <div className="p-colors">
          {visibleColors.map((c, i) => (
            <span
              key={i}
              className={`color-dot ${
                selectedColor === c.hex ? "selected" : ""
              }`}
              title={c.name || c.hex}
              style={{ backgroundColor: c.hex }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColor(c.hex);
              }}
            >
              {/* Viền ngoài khi selected – dùng pseudo qua CSS */}
            </span>
          ))}
          {extraCount > 0 && <span className="color-extra">+{extraCount}</span>}
        </div>

        {/* Tên sản phẩm */}
        <h4 className="p-name">{product.name}</h4>

        {/* Loại sản phẩm */}
        <p className="p-type">{product.label || "Classic Unisex T-shirt"}</p>

        {/* Giá */}
        <p className="p-price">{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
