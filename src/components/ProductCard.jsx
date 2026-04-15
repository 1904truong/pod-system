import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductCard.css";
import useActiveStoreDiscount from "../hooks/useActiveStoreDiscount";
import { calculateDiscountedPrice, isDiscountApplicable } from "../utils/discountUtils";
import MockupWithDesign from "./MockupWithDesign";

const ProductCard = ({ product, liked, onToggleLike }) => {
  const navigate = useNavigate();
  const [internalLiked, setInternalLiked] = useState(false);
  const isLiked = typeof liked === "boolean" ? liked : internalLiked;
  
  const designerDraft = product.designerDraft;
  const baseProduct = product.baseProduct;

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

  const { discountInPlay } = useActiveStoreDiscount();

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (typeof onToggleLike === "function") {
      onToggleLike(!isLiked);
    } else {
      setInternalLiked(!isLiked);
    }
  };

  // Logic to determine if a discount applies and calculate the new price
  const originalPriceNum = parseFloat(String(product.price || "0").replace(/[^0-9.]/g, ""));
  const applies = isDiscountApplicable(discountInPlay, product.campaignId || product.id);
  const discountedPriceNum = applies ? calculateDiscountedPrice(originalPriceNum, discountInPlay) : originalPriceNum;
  const hasDiscount = applies && discountedPriceNum < originalPriceNum;

  const resolveImageUrl = (value) => {
    if (!value || typeof value !== "string") return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("data:")) return value;
    
    // If it's already an absolute path (starts with /)
    if (value.startsWith("/")) {
      if (value.startsWith("/uploads")) return `http://localhost:5000${value}`;
      return value;
    }

    if (value.startsWith("assets/")) return `/${value}`;
    return `/assets/${value}`;
  };

  const imageSrc = resolveImageUrl(product.imageUrl || product.image);

  return (
    /* ── CARD WRAPPER ── */
    <div 
      className="product-card" 
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* ── ẢNH SẢN PHẨM ── */}
      <div className="product-image">
        {designerDraft ? (
          <MockupWithDesign
            key={`mockup-${product.id}`}
            mockupSrc={imageSrc}
            alt={product.name}
            product={product}
            designerDraft={designerDraft}
            variant="preview"
          />
        ) : imageSrc ? (
          <img src={imageSrc} alt={product.name} />
        ) : (
          <div className="product-image-fallback">No image</div>
        )}

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
        <p className="p-price">
          {hasDiscount ? (
            <>
              <span className="p-price-original" style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '0.8rem', fontSize: '1.3rem' }}>
                {product.price}
              </span>
              <span className="p-price-discounted" style={{ color: '#16a34a', fontWeight: 'bold' }}>
                ${discountedPriceNum.toFixed(2)}
              </span>
            </>
          ) : (
            product.price
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
