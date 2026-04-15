import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductCatalog = ({ selectedCategory, selectedStore: _selectedStore }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // Dummy product data
  const products = [
    {
      id: 1,
      name: 'Classic Unisex T-shirt',
      brand: 'Gildan 64000, Gildan 5000',
      technology: 'DTG',
      sizes: '8',
      fulfilledFrom: 'Europe, United Kingdom, United States',
      price: 6.98,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#c6b59c', '#d87093']
    },
    {
      id: 2,
      name: 'Premium Men\'s Hoodie',
      brand: 'Bella+Canvas 3719',
      technology: 'DTG',
      sizes: '6',
      fulfilledFrom: 'Europe, United States',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#808080', '#000080']
    },
    {
      id: 3,
      name: 'Classic Sweatshirt',
      brand: 'Gildan 18000',
      technology: 'DTG',
      sizes: '7',
      fulfilledFrom: 'Europe, United Kingdom, United States',
      price: 14.50,
      image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#708090', '#006400']
    },
    {
      id: 4,
      name: 'Women\'s Crop Top',
      brand: 'Bella+Canvas 6681',
      technology: 'DTG',
      sizes: '5',
      fulfilledFrom: 'Europe, United States',
      price: 11.20,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#ffc0cb', '#e6e6fa']
    },
    {
      id: 5,
      name: 'Comfort Colors Tee',
      brand: 'Comfort Colors 1717',
      technology: 'DTG',
      sizes: '8',
      fulfilledFrom: 'United States',
      price: 13.49,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: ['#f5f5dc', '#fffacd', '#e9967a', '#87ceeb']
    },
    {
      id: 6,
      name: 'Classic Polo Shirt',
      brand: 'Port and Company KP155',
      technology: 'DTF',
      sizes: '6',
      fulfilledFrom: 'Europe, United States',
      price: 15.60,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#000080', '#006400']
    },
    {
      id: 7,
      name: 'All-Over Print Tee',
      brand: 'LAT Apparel 6901',
      technology: 'AOP',
      sizes: '6',
      fulfilledFrom: 'Europe, United States',
      price: 18.30,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#f5deb3', '#e0ffff']
    },
    {
      id: 8,
      name: 'Premium Hoodie',
      brand: 'Bella+Canvas 3719',
      technology: 'Sublimation',
      sizes: '6',
      fulfilledFrom: 'Europe, United States',
      price: 22.50,
      image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
      colors: ['#ffffff', '#000000', '#c0c0c0', '#ffc0cb']
    }
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleProductClick = (product) => {
    navigate('/catalog-product/' + product.id, { state: { product } });
  };

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Lowest price' },
    { value: 'price-desc', label: 'Highest price' },
    { value: 'name', label: 'Product name' }
  ];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="relative max-w-2xl">
          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins' }}>
            {selectedCategory || 'All Products'}
          </h1>
          <p className="text-gray-600 max-w-xl">
            Create, customize, and sell globally with our popular range of products.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            <span>Sort by: <span className="font-semibold">{sortOptions.find(o => o.value === sortBy)?.label}</span></span>
            <svg
              className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {sortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition ${
                    sortBy === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-auto p-6">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
                isSelected={selectedProducts.has(product.id)}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {sortedProducts.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{sortedProducts.length}</span> products
          </p>
          {selectedProducts.size > 0 && (
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              Start Designing ({selectedProducts.size})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
