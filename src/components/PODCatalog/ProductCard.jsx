import React, { useState } from 'react';
import useActiveStoreDiscount from '../../hooks/useActiveStoreDiscount';
import { calculateDiscountedPrice, isDiscountApplicable } from '../../utils/discountUtils';

const ProductCard = ({ product, onSelect, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const { discountInPlay } = useActiveStoreDiscount();

  const originalPrice = product.price || 0;
  const applies = isDiscountApplicable(discountInPlay, product.campaignId || product.id);
  const discountedPrice = applies ? calculateDiscountedPrice(originalPrice, discountInPlay) : originalPrice;
  const hasDiscount = applies && discountedPrice < originalPrice;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-square group">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 w-5 h-5 rounded cursor-pointer z-10 accent-blue-600"
        />

        {/* Product Image */}
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs text-gray-500">Photo Placeholder</p>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
      </div>

      {/* Content Container */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2" style={{ fontFamily: 'Inter' }}>
          {product.name}
        </h3>

        {/* Brand */}
        <p className="text-sm text-gray-500 mb-3">{product.brand}</p>

        {/* Details */}
        <div className="space-y-2 text-xs text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Technology:</span>
            <span className="font-medium text-gray-700">{product.technology}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Sizes:</span>
            <span className="font-medium text-gray-700">{product.sizes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fulfilled From:</span>
            <span className="font-medium text-gray-700">{product.fulfilledFrom}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                <span className="text-sm font-bold text-green-600">${discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-900">${originalPrice.toFixed(2)}</span>
            )}
          </div>
          <div className="flex gap-1">
            {product.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:border-gray-500 transition"
                style={{ backgroundColor: color }}
                title={`Color ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
